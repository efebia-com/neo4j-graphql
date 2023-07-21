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
} from "graphql";
import { Kind, GraphQLError } from "graphql";
import type { SDLValidationContext } from "graphql/validation/ValidationContext";
import { getInnerTypeName } from "./directive-argument-value-is-valid";

// TODO: replace with schema model built-in graphql scalars
const SCALAR_TYPE_NAMES = ["string", "int", "float", "boolean", "id"];

export function ValidJwtDirectives() {
    return function (context: SDLValidationContext): ASTVisitor {
        let seenJwtType = false;
        return {
            Directive(directiveNode: DirectiveNode, _key, _parent, path, ancestors) {
                const isJwtDirective = directiveNode.name.value === "jwt";
                const isJwtClaimDirective = directiveNode.name.value === "jwtClaim";
                if (!isJwtDirective && !isJwtClaimDirective) {
                    return;
                }

                const [temp, traversedDef, parentOfTraversedDef] = getPathToDirectiveNode(path, ancestors);
                if (!traversedDef) {
                    console.error("No last definition traversed");
                    return;
                }
                const pathToHere = [...temp, `@${directiveNode.name.value}`];

                let result;
                if (isJwtDirective) {
                    result = assertJwtDirective(traversedDef as ObjectTypeDefinitionNode, seenJwtType);
                    seenJwtType = result.seenJwtType;
                } else {
                    result = assertJwtClaimDirective(
                        traversedDef as FieldDefinitionNode,
                        parentOfTraversedDef as ObjectTypeDefinitionNode
                    );
                }

                const { isValid, errorMsg } = result;

                if (!isValid) {
                    const errorOpts = {
                        nodes: [directiveNode, traversedDef],
                        // extensions: {
                        //     exception: { code: VALIDATION_ERROR_CODES[genericDirectiveName.toUpperCase()] },
                        // },
                        path: pathToHere,
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

function getPathToDirectiveNode(
    path: readonly (number | string)[],
    ancenstors: readonly (ASTNode | readonly ASTNode[])[]
): [
    Array<string>,
    ObjectTypeDefinitionNode | FieldDefinitionNode | InterfaceTypeDefinitionNode | undefined,
    ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode | undefined
] {
    const documentASTNodes = ancenstors[1];
    if (!documentASTNodes || (Array.isArray(documentASTNodes) && !documentASTNodes.length)) {
        return [[], undefined, undefined];
    }
    const [, definitionIdx] = path;
    const traversedDefinition = documentASTNodes[definitionIdx as number];
    const pathToHere: (ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode | FieldDefinitionNode)[] = [
        traversedDefinition,
    ];
    let lastSeenDefinition: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode | FieldDefinitionNode =
        traversedDefinition;
    const getNextDefinition = parsePath(path, traversedDefinition);
    for (const definition of getNextDefinition()) {
        lastSeenDefinition = definition;
        pathToHere.push(definition);
    }
    const parentOfLastSeenDefinition = pathToHere.slice(-2)[0] as
        | ObjectTypeDefinitionNode
        | InterfaceTypeDefinitionNode;
    return [pathToHere.map((n) => n.name?.value || "Schema"), lastSeenDefinition, parentOfLastSeenDefinition];
}

function parsePath(
    path: readonly (number | string)[],
    traversedDefinition: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode | FieldDefinitionNode
) {
    return function* getNextDefinition(idx = 2) {
        while (path[idx] && path[idx] !== "directives") {
            // continue parsing for annotated fields
            const key = path[idx] as string;
            const idxAtKey = path[idx + 1] as number;
            traversedDefinition = traversedDefinition[key][idxAtKey];
            yield traversedDefinition;
            idx += 2;
        }
    };
}

type AssertionResponse = {
    isValid: boolean;
    errorMsg?: string;
    errorPath: ReadonlyArray<string | number>;
};

function assertJwtDirective(
    objectType: ObjectTypeDefinitionNode,
    seenJwtType: boolean
): AssertionResponse & { seenJwtType: boolean } {
    let isValid = true;
    let errorMsg, errorPath;

    const onError = (error: Error) => {
        isValid = false;
        errorMsg = error.message;
    };

    try {
        if (seenJwtType) {
            throw new Error(`Invalid directive usage: Directive @jwt can only be used once in the Type Definitions.`);
        } else {
            seenJwtType = true;
        }

        if (objectType.directives && objectType.directives.length > 1) {
            throw new Error(
                `Invalid directive usage: Directive @jwt cannot be used in combination with other directives.`
            );
        }
        if (
            objectType.fields?.some((field) => !SCALAR_TYPE_NAMES.includes(getInnerTypeName(field.type).toLowerCase()))
        ) {
            throw new Error(`Invalid directive usage: Fields of a @jwt type can only be Scalars or Lists of Scalars.`);
        }
    } catch (err) {
        onError(err as Error);
    }

    return { isValid, errorMsg, errorPath, seenJwtType };
}

function assertJwtClaimDirective(
    fieldType: FieldDefinitionNode,
    objectType: ObjectTypeDefinitionNode
): AssertionResponse {
    let isValid = true;
    let errorMsg, errorPath;

    const onError = (error: Error) => {
        isValid = false;
        errorMsg = error.message;
    };

    try {
        if (fieldType.directives && fieldType.directives.length > 1) {
            throw new Error(
                `Invalid directive usage: Directive @jwtClaim cannot be used in combination with other directives.`
            );
        }
        if (!objectType.directives?.find((d) => d.name.value === "jwt")) {
            throw new Error(`Invalid directive usage: Directive @jwtClaim can only be used in \\"@jwt\\" types.`);
        }
    } catch (err) {
        onError(err as Error);
    }

    return { isValid, errorMsg, errorPath };
}
