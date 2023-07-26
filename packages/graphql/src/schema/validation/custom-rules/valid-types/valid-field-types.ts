/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {
    ASTVisitor,
    DirectiveNode,
    ASTNode,
    ObjectTypeDefinitionNode,
    FieldDefinitionNode,
    InterfaceTypeDefinitionNode,
    ListTypeNode,
    TypeNode,
    NonNullTypeNode,
} from "graphql";
import { Kind, GraphQLError } from "graphql";
import type { SDLValidationContext } from "graphql/validation/ValidationContext";
import { verifyId } from "../directives/id";
import { verifyRelationshipFieldType } from "../directives/relationship";
import { verifyTimestamp } from "../directives/timestamp";
import { verifyUnique } from "../directives/unique";
import type { VALIDATION_FN } from "../utils/document-validation-error";
import { assertValid, DocumentValidationError } from "../utils/document-validation-error";
import { getPathToDirectiveNode } from "../utils/path-parser";

function getValidationFunctions(directiveName: string): VALIDATION_FN[] | undefined {
    switch (directiveName) {
        case "id":
            return [verifyId];
        case "timestamp":
            return [verifyTimestamp];
        case "unique":
            return [verifyUnique];
        case "relationship":
            return [verifyRelationshipFieldType];
        default:
            return;
    }
}

export function ValidFieldTypes() {
    return function (context: SDLValidationContext): ASTVisitor {
        return {
            FieldDefinition(field: FieldDefinitionNode, _key, _parent, path, ancestors) {
                const [temp] = getPathToDirectiveNode(path, ancestors);
                const { isValid, errorMsg } = assertValid([isNotMatrixType.bind(null, field)]);
                if (!isValid) {
                    const errorOpts = {
                        nodes: [field],
                        // extensions: {
                        //     exception: { code: VALIDATION_ERROR_CODES[genericDirectiveName.toUpperCase()] },
                        // },
                        path: temp,
                        source: undefined,
                        positions: undefined,
                        originalError: undefined,
                    };

                    // TODO: replace constructor to use errorOpts when dropping support for GraphQL15
                    context.reportError(
                        new GraphQLError(
                            errorMsg || "Error",
                            errorOpts.nodes,
                            errorOpts.source,
                            errorOpts.positions,
                            errorOpts.path,
                            errorOpts.originalError
                            // errorOpts.extensions
                        )
                    );
                }
            },
            Directive(directiveNode: DirectiveNode, _key, _parent, path, ancestors) {
                const [temp, traversedDef, parentOfTraversedDef] = getPathToDirectiveNode(path, ancestors);
                const validationFns = getValidationFunctions(directiveNode.name.value);
                if (!validationFns) {
                    return;
                }
                if (!traversedDef) {
                    console.error("No last definition traversed");
                    return;
                }

                const preappliedFns = validationFns.map((fn) =>
                    fn.bind(null, {
                        directiveNode,
                        traversedDef,
                        parentDef: parentOfTraversedDef,
                    })
                );
                const { isValid, errorMsg, errorPath } = assertValid(preappliedFns);
                if (!isValid) {
                    const errorOpts = {
                        nodes: [traversedDef],
                        // extensions: {
                        //     exception: { code: VALIDATION_ERROR_CODES[genericDirectiveName.toUpperCase()] },
                        // },
                        path: [...temp, ...errorPath],
                        source: undefined,
                        positions: undefined,
                        originalError: undefined,
                    };

                    // TODO: replace constructor to use errorOpts when dropping support for GraphQL15
                    context.reportError(
                        new GraphQLError(
                            errorMsg || "Error",
                            errorOpts.nodes,
                            errorOpts.source,
                            errorOpts.positions,
                            errorOpts.path,
                            errorOpts.originalError
                            // errorOpts.extensions
                        )
                    );
                }
            },
        };
    };
}

function isNotMatrixType(field: FieldDefinitionNode) {
    const isListType = field.type.kind === Kind.LIST_TYPE;
    if (isListType) {
        const listNode = field.type;
        const isMatrix = listNode.type.kind === Kind.LIST_TYPE;
        // && listNode.type.type.kind === Kind.LIST_TYPE;
        if (isMatrix) {
            throw new DocumentValidationError(`Invalid field type: Matrix arrays not supported.`, []);
        }
    }
}
