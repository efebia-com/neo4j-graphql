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

import { graphql } from "graphql";
import type { Driver, Integer } from "neo4j-driver";
import { isTime } from "neo4j-driver";
import { generate } from "randomstring";
import { Neo4jGraphQL } from "../../../../src/classes";
import Neo4j from "../../neo4j";

describe("timestamp/time", () => {
    let driver: Driver;
    let neo4j: Neo4j;

    beforeAll(async () => {
        neo4j = new Neo4j();
        driver = await neo4j.getDriver();
    });

    afterAll(async () => {
        await driver.close();
    });
    describe("create", () => {
        test("should create a movie (with timestamps)", async () => {
            const session = await neo4j.getSession();

            const typeDefs = `
                    type Movie {
                      id: ID
                      createdAt: Time @timestamp(operations: [CREATE])
                    }
                `;

            const neoSchema = new Neo4jGraphQL({ typeDefs });
            const schema = await neoSchema.getSchema();

            const id = generate({
                charset: "alphabetic",
            });

            const create = `
                    mutation ($id: ID!) {
                        createMovies(input: [{ id: $id }]) {
                            movies {
                                id
                            }
                        }
                    }
                `;

            try {
                const graphqlResult = await graphql({
                    schema,
                    source: create,
                    contextValue: neo4j.getContextValues(),
                    variableValues: { id },
                });

                expect(graphqlResult.errors).toBeFalsy();

                const neo4jResult = await session.run(
                    `
                            MATCH (movie:Movie {id: $id})
                            RETURN movie {.id, .createdAt} as movie
                        `,
                    { id }
                );

                const neo4jMovie: { id: string; createdAt: Date } = neo4jResult.records[0]?.toObject().movie;

                expect(neo4jMovie.id).toEqual(id);
                expect(isTime(neo4jMovie.createdAt)).toBe(true);
            } finally {
                await session.close();
            }
        });

        test("create timestamp on relationship property", async () => {
            const session = await neo4j.getSession();

            const typeDefs = `
                    type Actor {
                        name: String!
                    }

                    type ActedIn @relationshipProperties {
                        createdAt: Time! @timestamp(operations: [CREATE])
                        screenTime: Int!
                    }

                    type Movie {
                        title: String!
                        actors: [Actor!]! @relationship(type: "ACTED_IN", direction: IN, properties: "ActedIn")
                    }
                `;

            const neoSchema = new Neo4jGraphQL({ typeDefs });
            const schema = await neoSchema.getSchema();

            const title = generate({
                charset: "alphabetic",
            });
            const name = generate({
                charset: "alphabetic",
            });
            const screenTime = 60;

            const create = `
                    mutation($title: String!, $name: String!, $screenTime: Int!) {
                        createMovies(
                            input: [
                                { title: $title, actors: { create: [{ node: { name: $name }, edge: { screenTime: $screenTime } }] } }
                            ]
                        ) {
                            movies {
                                actorsConnection {
                                    edges {
                                        createdAt
                                    }
                                }
                            }
                        }
                    }
                `;

            try {
                const graphqlResult = await graphql({
                    schema,
                    source: create,
                    contextValue: neo4j.getContextValues(),
                    variableValues: { title, name, screenTime },
                });

                expect(graphqlResult.errors).toBeFalsy();

                const neo4jResult = await session.run(
                    `
                            MATCH (:Actor {name: $name})-[r:ACTED_IN]->(:Movie {title: $title})
                            RETURN r { .createdAt, .screenTime} as relationship
                        `,
                    { title, name }
                );

                const neo4jRelationship: { createdAt: Date; screenTime: Integer } =
                    neo4jResult.records[0]?.toObject().relationship;

                expect(neo4jRelationship.screenTime.toInt()).toBe(screenTime);
                expect(isTime(neo4jRelationship.createdAt)).toBe(true);
            } finally {
                await session.close();
            }
        });
    });

    describe("update", () => {
        test("should update a movie (with timestamps)", async () => {
            const session = await neo4j.getSession();

            const typeDefs = `
                    type Movie {
                      id: ID
                      updatedAt: Time @timestamp(operations: [UPDATE])
                    }
                `;

            const neoSchema = new Neo4jGraphQL({ typeDefs });
            const schema = await neoSchema.getSchema();

            const id = generate({
                charset: "alphabetic",
            });

            const create = `
                    mutation ($id: ID!) {
                        updateMovies(where: {id: $id}, update: { id: $id }) {
                            movies {
                                id
                            }
                        }
                    }
                `;

            try {
                await session.run(`
                        CREATE (m:Movie {id: "${id}"})
                    `);

                const graphqlResult = await graphql({
                    schema,
                    source: create,
                    contextValue: neo4j.getContextValues(),
                    variableValues: { id },
                });

                expect(graphqlResult.errors).toBeFalsy();

                const neo4jResult = await session.run(`
                        MATCH (m:Movie {id: "${id}"})
                        RETURN m {.id, .updatedAt} as m
                    `);

                const neo4jMovie: { id: string; updatedAt: Date } = neo4jResult.records[0]?.toObject().m;

                expect(neo4jMovie.id).toEqual(id);
                expect(isTime(neo4jMovie.updatedAt)).toBe(true);
            } finally {
                await session.close();
            }
        });

        test("update timestamp on relationship property", async () => {
            const session = await neo4j.getSession();

            const typeDefs = `
                    type Actor {
                        name: String!
                    }

                    type ActedIn @relationshipProperties {
                        updatedAt: Time! @timestamp(operations: [UPDATE])
                        screenTime: Int!
                    }

                    type Movie {
                        title: String!
                        actors: [Actor!]! @relationship(type: "ACTED_IN", direction: IN, properties: "ActedIn")
                    }
                `;

            const neoSchema = new Neo4jGraphQL({ typeDefs });
            const schema = await neoSchema.getSchema();

            const title = generate({
                charset: "alphabetic",
            });
            const name = generate({
                charset: "alphabetic",
            });
            const screenTime = 60;

            const update = `
                    mutation($title: String!, $screenTime: Int!) {
                        updateMovies(
                            where: { title: $title }
                            update: { actors: [{ update: { edge: { screenTime: $screenTime } } }] }
                        ) {
                            movies {
                                actorsConnection {
                                    edges {
                                        updatedAt
                                    }
                                }
                            }
                        }
                    }
                `;

            try {
                await session.run(
                    `
                            CREATE (:Movie {title: $title})<-[:ACTED_IN {screenTime: 30}]-(:Actor {name: $name})
                        `,
                    { title, name }
                );

                const graphqlResult = await graphql({
                    schema,
                    source: update,
                    contextValue: neo4j.getContextValues(),
                    variableValues: { title, screenTime },
                });

                expect(graphqlResult.errors).toBeFalsy();

                const neo4jResult = await session.run(
                    `
                            MATCH (:Actor {name: $name})-[r:ACTED_IN]->(:Movie {title: $title})
                            RETURN r { .updatedAt, .screenTime} as relationship
                        `,
                    { title, name }
                );

                const neo4jRelationship: { updatedAt: Date; screenTime: Integer } =
                    neo4jResult.records[0]?.toObject().relationship;

                expect(neo4jRelationship.screenTime.toInt()).toBe(screenTime);
                expect(isTime(neo4jRelationship.updatedAt)).toBe(true);
            } finally {
                await session.close();
            }
        });
    });

    describe("create/update (explicit)", () => {
        test("should create a movie (with timestamps)", async () => {
            const session = await neo4j.getSession();

            const typeDefs = `
                    type Movie {
                      id: ID
                      createdAt: Time @timestamp(operations: [CREATE, UPDATE])
                    }
                `;

            const neoSchema = new Neo4jGraphQL({ typeDefs });
            const schema = await neoSchema.getSchema();

            const id = generate({
                charset: "alphabetic",
            });

            const create = `
                    mutation {
                        createMovies(input: [{ id: "${id}" }]) {
                            movies {
                                id
                            }
                        }
                    }
                `;

            try {
                const graphqlResult = await graphql({
                    schema,
                    source: create,
                    contextValue: neo4j.getContextValues(),
                });

                expect(graphqlResult.errors).toBeFalsy();

                const neo4jResult = await session.run(`
                        MATCH (m:Movie {id: "${id}"})
                        RETURN m {.id, .createdAt} as movie
                    `);

                const neo4jMovie: { id: string; createdAt: Date } = neo4jResult.records[0]?.toObject().movie;

                expect(neo4jMovie.id).toEqual(id);
                expect(isTime(neo4jMovie.createdAt)).toBe(true);
            } finally {
                await session.close();
            }
        });

        test("create timestamp on relationship property", async () => {
            const session = await neo4j.getSession();

            const typeDefs = `
                    type Actor {
                        name: String!
                    }

                    type ActedIn @relationshipProperties {
                        createdAt: Time! @timestamp(operations: [CREATE, UPDATE])
                        screenTime: Int!
                    }

                    type Movie {
                        title: String!
                        actors: [Actor!]! @relationship(type: "ACTED_IN", direction: IN, properties: "ActedIn")
                    }
                `;

            const neoSchema = new Neo4jGraphQL({ typeDefs });
            const schema = await neoSchema.getSchema();

            const title = generate({
                charset: "alphabetic",
            });
            const name = generate({
                charset: "alphabetic",
            });
            const screenTime = 60;

            const create = `
                    mutation($title: String!, $name: String!, $screenTime: Int!) {
                        createMovies(
                            input: [
                                { title: $title, actors: { create: [{ node: { name: $name }, edge: { screenTime: $screenTime } }] } }
                            ]
                        ) {
                            movies {
                                actorsConnection {
                                    edges {
                                        createdAt
                                    }
                                }
                            }
                        }
                    }
                `;

            try {
                const graphqlResult = await graphql({
                    schema,
                    source: create,
                    contextValue: neo4j.getContextValues(),
                    variableValues: { title, name, screenTime },
                });

                expect(graphqlResult.errors).toBeFalsy();

                const neo4jResult = await session.run(
                    `
                            MATCH (:Actor {name: $name})-[r:ACTED_IN]->(:Movie {title: $title})
                            RETURN r { .createdAt, .screenTime } as relationship
                        `,
                    { title, name }
                );

                const neo4jRelationship: { createdAt: Date; screenTime: Integer } =
                    neo4jResult.records[0]?.toObject().relationship;

                expect(neo4jRelationship.screenTime.toInt()).toBe(screenTime);
                expect(isTime(neo4jRelationship.createdAt)).toBe(true);
            } finally {
                await session.close();
            }
        });

        test("update timestamp on relationship property", async () => {
            const session = await neo4j.getSession();

            const typeDefs = `
                    type Actor {
                        name: String!
                    }

                    type ActedIn @relationshipProperties {
                        updatedAt: Time! @timestamp(operations: [CREATE, UPDATE])
                        screenTime: Int!
                    }

                    type Movie {
                        title: String!
                        actors: [Actor!]! @relationship(type: "ACTED_IN", direction: IN, properties: "ActedIn")
                    }
                `;

            const neoSchema = new Neo4jGraphQL({ typeDefs });
            const schema = await neoSchema.getSchema();

            const title = generate({
                charset: "alphabetic",
            });
            const name = generate({
                charset: "alphabetic",
            });
            const screenTime = 60;

            const update = `
                    mutation($title: String!, $screenTime: Int!) {
                        updateMovies(
                            where: { title: $title }
                            update: { actors: [{ update: { edge: { screenTime: $screenTime } } }] }
                        ) {
                            movies {
                                actorsConnection {
                                    edges {
                                        updatedAt
                                    }
                                }
                            }
                        }
                    }
                `;

            try {
                await session.run(
                    `
                            CREATE (:Movie {title: $title})<-[:ACTED_IN {screenTime: 30}]-(:Actor {name: $name})
                        `,
                    { title, name }
                );

                const graphqlResult = await graphql({
                    schema,
                    source: update,
                    contextValue: neo4j.getContextValues(),
                    variableValues: { title, screenTime },
                });

                expect(graphqlResult.errors).toBeFalsy();

                const neo4jResult = await session.run(
                    `
                            MATCH (:Actor {name: $name})-[r:ACTED_IN]->(:Movie {title: $title})
                            RETURN r { .updatedAt, .screenTime } as relationship
                        `,
                    { title, name }
                );

                const neo4jRelationship: { updatedAt: Date; screenTime: Integer } =
                    neo4jResult.records[0]?.toObject().relationship;

                expect(neo4jRelationship.screenTime.toInt()).toBe(screenTime);
                expect(isTime(neo4jRelationship.updatedAt)).toBe(true);
            } finally {
                await session.close();
            }
        });

        test("should update a movie (with timestamps)", async () => {
            const session = await neo4j.getSession();

            const typeDefs = `
                    type Movie {
                      id: ID
                      updatedAt: Time @timestamp(operations: [CREATE, UPDATE])
                    }
                `;

            const neoSchema = new Neo4jGraphQL({ typeDefs });
            const schema = await neoSchema.getSchema();

            const id = generate({
                charset: "alphabetic",
            });

            const create = `
                    mutation ($id: ID!) {
                        updateMovies(where: {id: $id}, update: { id: $id }) {
                            movies {
                                id
                            }
                        }
                    }
                `;

            try {
                await session.run(`
                        CREATE (m:Movie {id: "${id}"})
                    `);

                const graphqlResult = await graphql({
                    schema,
                    source: create,
                    contextValue: neo4j.getContextValues(),
                    variableValues: { id },
                });

                expect(graphqlResult.errors).toBeFalsy();

                const neo4jResult = await session.run(`
                        MATCH (m:Movie {id: "${id}"})
                        RETURN m {.id, .updatedAt} as movie
                    `);

                const neo4jMovie: { id: string; updatedAt: Date } = neo4jResult.records[0]?.toObject().movie;

                expect(neo4jMovie.id).toEqual(id);
                expect(isTime(neo4jMovie.updatedAt)).toBe(true);
            } finally {
                await session.close();
            }
        });
    });

    describe("create/update (implicit)", () => {
        test("should create a movie (with timestamps)", async () => {
            const session = await neo4j.getSession();

            const typeDefs = `
                    type Movie {
                      id: ID
                      createdAt: Time @timestamp
                    }
                `;

            const neoSchema = new Neo4jGraphQL({ typeDefs });
            const schema = await neoSchema.getSchema();

            const id = generate({
                charset: "alphabetic",
            });

            const create = `
                    mutation {
                        createMovies(input: [{ id: "${id}" }]) {
                            movies {
                                id
                            }
                        }
                    }
                `;

            try {
                const graphqlResult = await graphql({
                    schema,
                    source: create,
                    contextValue: neo4j.getContextValues(),
                });

                expect(graphqlResult.errors).toBeFalsy();

                const neo4jResult = await session.run(`
                        MATCH (m:Movie {id: "${id}"})
                        RETURN m { .id, .createdAt } as movie
                    `);

                const neo4jMovie: { id: string; createdAt: Date } = neo4jResult.records[0]?.toObject().movie;

                expect(neo4jMovie.id).toEqual(id);
                expect(isTime(neo4jMovie.createdAt)).toBe(true);
            } finally {
                await session.close();
            }
        });

        test("create timestamp on relationship property", async () => {
            const session = await neo4j.getSession();

            const typeDefs = `
                    type Actor {
                        name: String!
                    }

                    type ActedIn @relationshipProperties {
                        createdAt: Time! @timestamp
                        screenTime: Int!
                    }

                    type Movie {
                        title: String!
                        actors: [Actor!]! @relationship(type: "ACTED_IN", direction: IN, properties: "ActedIn")
                    }
                `;

            const neoSchema = new Neo4jGraphQL({ typeDefs });

            const title = generate({
                charset: "alphabetic",
            });
            const name = generate({
                charset: "alphabetic",
            });
            const screenTime = 60;

            const create = `
                    mutation($title: String!, $name: String!, $screenTime: Int!) {
                        createMovies(
                            input: [
                                { title: $title, actors: { create: [{ node: { name: $name }, edge: { screenTime: $screenTime } }] } }
                            ]
                        ) {
                            movies {
                                actorsConnection {
                                    edges {
                                        createdAt
                                    }
                                }
                            }
                        }
                    }
                `;

            try {
                const graphqlResult = await graphql({
                    schema: await neoSchema.getSchema(),
                    source: create,
                    contextValue: neo4j.getContextValues(),
                    variableValues: { title, name, screenTime },
                });

                expect(graphqlResult.errors).toBeFalsy();

                const neo4jResult = await session.run(
                    `
                            MATCH (:Actor {name: $name})-[r:ACTED_IN]->(:Movie {title: $title})
                            RETURN r { .createdAt, .screenTime } as relationship
                        `,
                    { title, name }
                );

                const neo4jRelationship: { createdAt: Date; screenTime: Integer } =
                    neo4jResult.records[0]?.toObject().relationship;

                expect(neo4jRelationship.screenTime.toInt()).toBe(screenTime);
                expect(isTime(neo4jRelationship.createdAt)).toBe(true);
            } finally {
                await session.close();
            }
        });

        test("update timestamp on relationship property", async () => {
            const session = await neo4j.getSession();

            const typeDefs = `
                    type Actor {
                        name: String!
                    }

                    type ActedIn @relationshipProperties {
                        updatedAt: Time! @timestamp
                        screenTime: Int!
                    }

                    type Movie {
                        title: String!
                        actors: [Actor!]! @relationship(type: "ACTED_IN", direction: IN, properties: "ActedIn")
                    }
                `;

            const neoSchema = new Neo4jGraphQL({ typeDefs });
            const schema = await neoSchema.getSchema();

            const title = generate({
                charset: "alphabetic",
            });
            const name = generate({
                charset: "alphabetic",
            });
            const screenTime = 60;

            const update = `
                    mutation($title: String!, $screenTime: Int!) {
                        updateMovies(
                            where: { title: $title }
                            update: { actors: [{ update: { edge: { screenTime: $screenTime } } }] }
                        ) {
                            movies {
                                actorsConnection {
                                    edges {
                                        updatedAt
                                    }
                                }
                            }
                        }
                    }
                `;

            try {
                await session.run(
                    `
                            CREATE (:Movie {title: $title})<-[:ACTED_IN {screenTime: 30}]-(:Actor {name: $name})
                        `,
                    { title, name }
                );

                const graphqlResult = await graphql({
                    schema,
                    source: update,
                    contextValue: neo4j.getContextValues(),
                    variableValues: { title, screenTime },
                });

                expect(graphqlResult.errors).toBeFalsy();

                const neo4jResult = await session.run(
                    `
                            MATCH (:Actor {name: $name})-[r:ACTED_IN]->(:Movie {title: $title})
                            RETURN r { .updatedAt, .screenTime } as relationship
                        `,
                    { title, name }
                );

                const neo4jRelationship: { updatedAt: Date; screenTime: Integer } =
                    neo4jResult.records[0]?.toObject().relationship;

                expect(neo4jRelationship.screenTime.toInt()).toBe(screenTime);
                expect(isTime(neo4jRelationship.updatedAt)).toBe(true);
            } finally {
                await session.close();
            }
        });

        test("should update a movie (with timestamps)", async () => {
            const session = await neo4j.getSession();

            const typeDefs = `
                    type Movie {
                      id: ID
                      updatedAt: Time @timestamp
                    }
                `;

            const neoSchema = new Neo4jGraphQL({ typeDefs });
            const schema = await neoSchema.getSchema();

            const id = generate({
                charset: "alphabetic",
            });

            const create = `
                    mutation ($id: ID!) {
                        updateMovies(where: {id: $id}, update: { id: $id }) {
                            movies {
                                id
                            }
                        }
                    }
                `;

            try {
                await session.run(`
                        CREATE (m:Movie {id: "${id}"})
                    `);

                const graphqlResult = await graphql({
                    schema,
                    source: create,
                    contextValue: neo4j.getContextValues(),
                    variableValues: { id },
                });

                expect(graphqlResult.errors).toBeFalsy();

                const neo4jResult = await session.run(`
                        MATCH (m:Movie {id: "${id}"})
                        RETURN m { .id, .updatedAt } as movie
                    `);

                const neo4jMovie: { id: string; updatedAt: Date } = neo4jResult.records[0]?.toObject().movie;

                expect(neo4jMovie.id).toEqual(id);
                expect(isTime(neo4jMovie.updatedAt)).toBe(true);
            } finally {
                await session.close();
            }
        });
    });
});
