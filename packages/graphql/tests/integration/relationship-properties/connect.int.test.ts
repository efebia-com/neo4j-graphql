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
import { gql } from "graphql-tag";
import type { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import { Neo4jGraphQL } from "../../../src/classes";
import Neo4j from "../neo4j";

describe("Relationship properties - connect", () => {
    let driver: Driver;
    let neo4j: Neo4j;

    beforeAll(async () => {
        neo4j = new Neo4j();
        driver = await neo4j.getDriver();
    });

    afterAll(async () => {
        await driver.close();
    });

    test("should create a movie while connecting a relationship that has properties", async () => {
        const typeDefs = gql`
            type Movie {
                title: String!
                actors: [Actor!]! @relationship(type: "ACTED_IN", properties: "ActedIn", direction: IN)
            }

            type Actor {
                name: String!
                movies: [Movie!]! @relationship(type: "ACTED_IN", properties: "ActedIn", direction: OUT)
            }

            type ActedIn @relationshipProperties {
                screenTime: Int!
            }
        `;

        const neoSchema = new Neo4jGraphQL({
            typeDefs,
        });

        const session = await neo4j.getSession();
        const movieTitle = generate({ charset: "alphabetic" });
        const actorName = generate({ charset: "alphabetic" });
        const screenTime = Math.floor((Math.random() * 1e3) / Math.random());

        const source = `
            mutation($movieTitle: String!, $screenTime: Int!, $actorName: String!) {
                createMovies(
                    input: [
                        {
                            title: $movieTitle
                            actors: {
                                connect: [{
                                    where: { node: { name: $actorName } },
                                    edge: { screenTime: $screenTime },
                                }]
                            }
                        }
                    ]
                ) {
                    movies {
                        title
                        actorsConnection {
                            edges {
                                screenTime
                                node {
                                    name
                                }
                            }
                        }
                    }
                }
            }
        `;

        try {
            await session.run(
                `
                    CREATE (:Actor {name:$actorName})
                `,
                { actorName }
            );

            const gqlResult = await graphql({
                schema: await neoSchema.getSchema(),
                source,
                contextValue: neo4j.getContextValues(),
                variableValues: { movieTitle, actorName, screenTime },
            });
            expect(gqlResult.errors).toBeFalsy();
            expect((gqlResult.data as any)?.createMovies.movies).toEqual([
                {
                    title: movieTitle,
                    actorsConnection: { edges: [{ screenTime, node: { name: actorName } }] },
                },
            ]);

            const cypher = `
                MATCH (m:Movie {title: $movieTitle})
                        <-[:ACTED_IN {screenTime: $screenTime}]-
                            (:Actor {name: $actorName})
                RETURN m
            `;

            const neo4jResult = await session.run(cypher, { movieTitle, screenTime, actorName });
            expect(neo4jResult.records).toHaveLength(1);
        } finally {
            await session.close();
        }
    });

    test("should create an actor while connecting a relationship that has properties(with Union)", async () => {
        const typeDefs = gql`
            type Movie {
                title: String!
            }

            type Show {
                name: String!
            }

            type Actor {
                name: String!
                actedIn: [ActedInUnion!]!
                    @relationship(type: "ACTED_IN", properties: "ActedInInterface", direction: OUT)
            }

            union ActedInUnion = Movie | Show

            type ActedInInterface @relationshipProperties {
                screenTime: Int!
            }
        `;

        const neoSchema = new Neo4jGraphQL({
            typeDefs,
        });

        const session = await neo4j.getSession();
        const movieTitle = generate({ charset: "alphabetic" });
        const actorName = generate({ charset: "alphabetic" });
        const screenTime = Math.floor((Math.random() * 1e3) / Math.random());

        const source = `
            mutation($movieTitle: String!, $screenTime: Int!, $actorName: String!) {
                createActors(input: [{
                    name: $actorName,
                    actedIn: {
                        Movie: {
                            connect: {
                                where: {
                                    node: { title: $movieTitle }
                                },
                                edge: {
                                    screenTime: $screenTime
                                }
                            }
                        }
                    }
                }]) {
                    actors {
                        name
                    }
                }
            }
        `;

        try {
            await session.run(
                `
                    CREATE (:Movie {title:$movieTitle})
                `,
                { movieTitle }
            );

            const gqlResult = await graphql({
                schema: await neoSchema.getSchema(),
                source,
                contextValue: neo4j.getContextValues(),
                variableValues: { movieTitle, actorName, screenTime },
            });
            expect(gqlResult.errors).toBeFalsy();
            expect((gqlResult.data as any)?.createActors.actors).toEqual([
                {
                    name: actorName,
                },
            ]);

            const cypher = `
                MATCH (a:Actor {name: $actorName})
                        -[:ACTED_IN {screenTime: $screenTime}]->
                            (:Movie {title: $movieTitle})
                RETURN a
            `;

            const neo4jResult = await session.run(cypher, { movieTitle, screenTime, actorName });
            expect(neo4jResult.records).toHaveLength(1);
        } finally {
            await session.close();
        }
    });

    test("should update a movie while connecting a relationship that has properties", async () => {
        const typeDefs = gql`
            type Movie {
                title: String!
                actors: [Actor!]! @relationship(type: "ACTED_IN", properties: "ActedIn", direction: IN)
            }

            type Actor {
                name: String!
                movies: [Movie!]! @relationship(type: "ACTED_IN", properties: "ActedIn", direction: OUT)
            }

            type ActedIn @relationshipProperties {
                screenTime: Int!
            }
        `;

        const neoSchema = new Neo4jGraphQL({
            typeDefs,
        });

        const session = await neo4j.getSession();
        const movieTitle = generate({ charset: "alphabetic" });
        const actorName = generate({ charset: "alphabetic" });
        const screenTime = Math.floor((Math.random() * 1e3) / Math.random());

        const source = `
            mutation($movieTitle: String!, $screenTime: Int!, $actorName: String!) {
                updateMovies(
                  where: { title: $movieTitle }
                  connect: {
                    actors: {
                      where: { node: { name: $actorName } }
                      edge: { screenTime: $screenTime }
                    }
                  }
                ) {
                    movies {
                        title
                        actorsConnection {
                            edges {
                                screenTime
                                node {
                                    name
                                }
                            }
                        }
                    }
                }
            }
        `;

        try {
            await session.run(
                `
                    CREATE (:Movie {title:$movieTitle})
                    CREATE (:Actor {name:$actorName})
                `,
                { movieTitle, actorName }
            );

            const gqlResult = await graphql({
                schema: await neoSchema.getSchema(),
                source,
                contextValue: neo4j.getContextValues(),
                variableValues: { movieTitle, actorName, screenTime },
            });
            expect(gqlResult.errors).toBeFalsy();
            expect((gqlResult.data as any)?.updateMovies.movies).toEqual([
                {
                    title: movieTitle,
                    actorsConnection: { edges: [{ screenTime, node: { name: actorName } }] },
                },
            ]);

            const cypher = `
                MATCH (m:Movie {title: $movieTitle})
                        <-[:ACTED_IN {screenTime: $screenTime}]-
                            (:Actor {name: $actorName})
                RETURN m
            `;

            const neo4jResult = await session.run(cypher, { movieTitle, screenTime, actorName });
            expect(neo4jResult.records).toHaveLength(1);
        } finally {
            await session.close();
        }
    });

    test("should update an actor while connecting a relationship that has properties(with Union)", async () => {
        const typeDefs = gql`
            type Movie {
                title: String!
            }
            type Show {
                name: String!
            }
            type Actor {
                name: String!
                actedIn: [ActedInUnion!]!
                    @relationship(type: "ACTED_IN", properties: "ActedInInterface", direction: OUT)
            }
            union ActedInUnion = Movie | Show
            type ActedInInterface @relationshipProperties {
                screenTime: Int!
            }
        `;

        const neoSchema = new Neo4jGraphQL({
            typeDefs,
        });

        const session = await neo4j.getSession();
        const movieTitle = generate({ charset: "alphabetic" });
        const actorName = generate({ charset: "alphabetic" });
        const screenTime = Math.floor((Math.random() * 1e3) / Math.random());

        const source = `
            mutation($movieTitle: String!, $screenTime: Int!, $actorName: String!) {
                updateActors(
                    where: { name: $actorName }
                    connect: {
                        actedIn: {
                            Movie: {
                                where: { node: { title: $movieTitle } }
                                edge: { screenTime: $screenTime }
                            }
                        }
                    }
                ) {
                    actors {
                        name
                    }
                }
            }
        `;

        try {
            await session.run(
                `
                    CREATE (:Movie {title:$movieTitle})
                    CREATE (:Actor {name:$actorName})
                `,
                { movieTitle, actorName }
            );

            const gqlResult = await graphql({
                schema: await neoSchema.getSchema(),
                source,
                contextValue: neo4j.getContextValues(),
                variableValues: { movieTitle, actorName, screenTime },
            });
            expect(gqlResult.errors).toBeFalsy();
            expect((gqlResult.data as any)?.updateActors.actors).toEqual([
                {
                    name: actorName,
                },
            ]);

            const cypher = `
                MATCH (a:Actor {name: $actorName})
                        -[:ACTED_IN {screenTime: $screenTime}]->
                            (:Movie {title: $movieTitle})
                RETURN a
            `;

            const neo4jResult = await session.run(cypher, { movieTitle, screenTime, actorName });
            expect(neo4jResult.records).toHaveLength(1);
        } finally {
            await session.close();
        }
    });
});
