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

import { graphql, GraphQLSchema } from "graphql";
import { Driver } from "neo4j-driver";
import { Neo4jGraphQLAuthJWTPlugin } from "@neo4j/graphql-plugin-auth";
import neo4j from "../neo4j";
import { Neo4jGraphQL } from "../../../src";
import { createJwtRequest } from "../../utils/create-jwt-request";

describe("https://github.com/neo4j/graphql/issues/1150", () => {
    let schema: GraphQLSchema;
    let driver: Driver;

    beforeAll(async () => {
        driver = await neo4j();

        const typeDefs = `
            type Battery @exclude(operations: [CREATE, UPDATE, DELETE]) {
                batterySeriesNumber: String
                nameMigrated: String
            }

            extend type Battery @auth(rules: [{ isAuthenticated: true, roles: ["admin"] }])

            extend type Battery {
                id: ID! @id(autogenerate: false)
                current: Boolean!
            }

            type CombustionEngine @exclude(operations: [CREATE, UPDATE, DELETE]) {
                power: Int
                torqueMaximum: Int
            }

            extend type CombustionEngine {
                id: ID! @id(autogenerate: false)
                current: Boolean!
            }

            type Drive @exclude(operations: [CREATE, UPDATE, DELETE]) {
                driveCompositions: [DriveComposition!]!
                    @relationship(type: "CONSISTS_OF", properties: "RelationProps", direction: OUT)
            }

            extend type Drive {
                id: ID! @id(autogenerate: false)
                current: Boolean!
            }

            union DriveComponent = Battery | CombustionEngine

            type DriveComposition @exclude(operations: [CREATE, UPDATE, DELETE]) {
                driveComponent: [DriveComponent!]!
                    @relationship(type: "HAS", properties: "RelationProps", direction: OUT)
            }

            extend type DriveComposition {
                id: ID! @id(autogenerate: false)
                current: Boolean!
            }

            interface RelationProps {
                current: Boolean!
            }
        `;
        const neoGraphql = new Neo4jGraphQL({
            typeDefs,
            driver,
            plugins: {
                auth: new Neo4jGraphQLAuthJWTPlugin({
                    secret: "secret",
                }),
            },
        });
        schema = await neoGraphql.getSchema();
    });

    afterAll(async () => {
        await driver.close();
    });

    test("should handle union types with auth and connection-where", async () => {
        const query = `
            query getDrivesWithFilteredUnionType {
                drives(where: { current: true }) {
                    current
                    driveCompositionsConnection(where: { edge: { current: true } }) {
                        edges {
                            node {
                                driveComponentConnection(
                                    where: {
                                        Battery: { edge: { current: true } }
                                        CombustionEngine: { edge: { current: true } }
                                    }
                                ) {
                                    edges {
                                        current
                                        node {
                                            ... on Battery {
                                                id
                                                batterySeriesNumber
                                                nameMigrated
                                            }
                                            ... on CombustionEngine {
                                                power
                                                torqueMaximum
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        const req = createJwtRequest("secret", { roles: "admin" });
        const res = await graphql({
            schema,
            source: query,
            contextValue: {
                driver,
                req,
            },
        });

        expect(res.errors).toBeUndefined();

        expect(res.data).toEqual({ drives: [] });
    });
});
