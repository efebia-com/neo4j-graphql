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

import { gql } from "apollo-server";
import type { DocumentNode } from "graphql";
import { Neo4jGraphQL } from "../../../src";
import { formatCypher, translateQuery, formatParams } from "../utils/tck-test-utils";

describe("https://github.com/neo4j/graphql/issues/1263", () => {
    let typeDefs: DocumentNode;
    let neoSchema: Neo4jGraphQL;

    beforeAll(() => {
        typeDefs = gql`
            interface Production {
                title: String!
            }

            type Movie implements Production {
                title: String!
                runtime: Int!
            }

            type Series implements Production {
                title: String!
                episodes: Int!
            }

            interface ActedIn @relationshipProperties {
                screenTime: Int!
            }

            type Actor {
                name: String!
                actedIn: [Production!]! @relationship(type: "ACTED_IN", direction: OUT, properties: "ActedIn")
            }
        `;

        neoSchema = new Neo4jGraphQL({
            typeDefs,
        });
    });

    test("doesn't have redundant check of non-existent parameter", async () => {
        const query = gql`
            query {
                actors {
                    name
                    actedInConnection(
                        where: {
                            node: { title: "foo", _on: { Movie: { runtime_GT: 90 }, Series: { episodes_GT: 50 } } }
                        }
                    ) {
                        edges {
                            node {
                                title
                            }
                        }
                    }
                }
            }
        `;
        const result = await translateQuery(neoSchema, query);

        expect(formatCypher(result.cypher)).toMatchInlineSnapshot(`
            "MATCH (this:\`Actor\`)
            CALL {
            WITH this
            CALL {
            WITH this
            MATCH (this)-[this_acted_in_relationship:ACTED_IN]->(this_Movie:Movie)
            WHERE (this_Movie.title = $this_actedInConnection_args_where_Movieparam0 AND this_Movie.runtime > $this_actedInConnection_args_where_Movieparam1)
            WITH { node: { __resolveType: \\"Movie\\", title: this_Movie.title } } AS edge
            RETURN edge
            UNION
            WITH this
            MATCH (this)-[this_acted_in_relationship:ACTED_IN]->(this_Series:Series)
            WHERE (this_Series.title = $this_actedInConnection_args_where_Seriesparam0 AND this_Series.episodes > $this_actedInConnection_args_where_Seriesparam1)
            WITH { node: { __resolveType: \\"Series\\", title: this_Series.title } } AS edge
            RETURN edge
            }
            WITH collect(edge) as edges
            WITH edges, size(edges) AS totalCount
            RETURN { edges: edges, totalCount: totalCount } AS actedInConnection
            }
            RETURN this { .name, actedInConnection } as this"
        `);

        expect(formatParams(result.params)).toMatchInlineSnapshot(`
            "{
                \\"this_actedInConnection_args_where_Movieparam0\\": \\"foo\\",
                \\"this_actedInConnection_args_where_Movieparam1\\": {
                    \\"low\\": 90,
                    \\"high\\": 0
                },
                \\"this_actedInConnection_args_where_Seriesparam0\\": \\"foo\\",
                \\"this_actedInConnection_args_where_Seriesparam1\\": {
                    \\"low\\": 50,
                    \\"high\\": 0
                },
                \\"this_actedInConnection\\": {
                    \\"args\\": {
                        \\"where\\": {
                            \\"node\\": {
                                \\"title\\": \\"foo\\",
                                \\"_on\\": {
                                    \\"Movie\\": {
                                        \\"runtime_GT\\": {
                                            \\"low\\": 90,
                                            \\"high\\": 0
                                        }
                                    },
                                    \\"Series\\": {
                                        \\"episodes_GT\\": {
                                            \\"low\\": 50,
                                            \\"high\\": 0
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }"
        `);
    });
});