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

import * as fs from "fs";
import * as path from "path";
import { generate as randomstring } from "randomstring";
import generate from "./generate";
import { OGM } from "./index";

describe("generate", () => {
    const filesToDelete: string[] = [];

    afterAll(async () => {
        await Promise.all(filesToDelete.map((name) => fs.promises.unlink(name)));
    });

    test("should generate simple types of a single node and return the string", async () => {
        const typeDefs = `
            type User {
                name: String
            }
        `;

        const ogm = new OGM({
            typeDefs,
            // @ts-ignore
            driver: {},
        });

        const generated = (await generate({
            ogm,
            noWrite: true,
        })) as string;

        expect(generated).toMatchInlineSnapshot(`
            "import type { SelectionSetNode, DocumentNode } from \\"graphql\\";
            import type { RawGQL } from \\"@efebia/neo4j-graphql-ogm\\";
            export type RequiredResolvers = Required<Resolvers>;
            export type Primitive = string | number | boolean;
            export type Prettify<T> = {
              [K in keyof T]: T[K];
            } & {};
            export type AddRawGQL<T> = NonNullable<T> extends (infer TItem)[]
              ? (TItem | RawGQL)[]
              : NonNullable<T> extends Primitive
              ? T
              : IsAny<NonNullable<T>> extends true
              ? T
              : {
                  [key in keyof T]: AddRawGQL<T[key]> | RawGQL;
                };

            export type AddRawGQLToOptions<TProps> = TProps extends { where?: infer TWhere }
              ? {
                  where?: AddRawGQL<NonNullable<TWhere>>;
                } & AddRawGQLToOptions<Omit<TProps, \\"where\\">>
              : TProps extends { sort?: infer TSort }
              ? {
                  sort?: NonNullable<TSort> extends (infer TItem)[]
                    ? AddRawGQL<NonNullable<TItem>>[]
                    : never;
                }
              : {};

            export type ResolverArgs<
              TModel extends object,
              TKey extends keyof TModel,
              TResolvers extends { [key: PropertyKey]: Resolver<any, any, any, any> }
            > = TModel[TKey] extends Primitive
              ? never
              : NonNullable<TResolvers[TKey]> extends Resolver<any, any, any, infer Props>
              ? \\"directed\\" extends keyof Props
                ? Omit<Props, \\"directed\\" | \\"where\\" | \\"sort\\"> & {
                    directed?: boolean;
                  } & AddRawGQLToOptions<Props>
                : {}
              : {};

            export type UnionToIntersection<U> = (
              U extends any ? (k: U) => void : never
            ) extends (k: infer I) => void
              ? I
              : never;
            type LastOf<T> = UnionToIntersection<
              T extends any ? () => T : never
            > extends () => infer R
              ? R
              : never;

            type Push<T extends any[], V> = [...T, V];

            export type TuplifyUnion<
              T,
              L = LastOf<T>,
              N = [T] extends [never] ? true : false
            > = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>;

            // This is pure magic
            export type MagicArray<TArray extends any[]> =
              NonNullable<TArray> extends (infer TItem)[] ? TItem[] : never;
            export type MagicObject<TElement> =
              NonNullable<TElement> extends (infer TItem)[]
                ? TItem[]
                : NonNullable<TElement> extends Primitive
                ? TElement
                : {
                    [key in keyof TElement as TElement[key] extends never
                      ? never
                      : key]: MagicObject<TElement[key]>;
                  };

            export type StripNeverKeys<TElement> = TElement extends object
              ? {
                  [key in keyof TElement as [TElement[key]] extends [never]
                    ? never
                    : TElement[key] extends never[]
                    ? never
                    : key]: TElement[key];
                }
              : TElement;

            export type ClearObjectWithNeverKeys<
              TElement,
              TStripped = StripNeverKeys<TElement>
            > = [keyof Omit<TElement, keyof TStripped>] extends [never] ? TStripped : never;

            export type StripNeverKeysAddTypename<
              TElement,
              TKey,
              TStripped = ClearObjectWithNeverKeys<TElement>
            > = [keyof TStripped] extends [never]
              ? never
              : TStripped & { __typename: TKey };

            type RetrieveType<TItem> = Exclude<
              TItem,
              Promise<any>
            > extends ResolverTypeWrapper<infer TValue>
              ? TValue extends { __typename?: infer TName }
                ? TItem extends object
                  ? TName extends keyof Resolvers
                    ? \\"__isTypeOf\\" extends keyof RequiredResolvers[TName]
                      ? Omit<RequiredResolvers[TName], \\"__isTypeOf\\"> extends {
                          [key: string]: Resolver<any, any, any, any>;
                        }
                        ? {
                            Model: Exclude<TItem, Promise<any>>;
                            Resolvers: Omit<RequiredResolvers[TName], \\"__isTypeOf\\">;
                          }
                        : never
                      : never
                    : never
                  : never
                : never
              : never;

            export type ResolverReturnType<
              TModel extends object,
              TKey extends keyof TModel,
              TResolvers extends { [key: PropertyKey]: Resolver<any, any, any, any> }
            > = TModel[TKey] extends Primitive
              ? never
              : NonNullable<TResolvers[TKey]> extends Resolver<infer Props, any, any, any>
              ? Props extends (infer TItem)[]
                ? RetrieveType<Exclude<TItem, Promise<any>>>
                : RetrieveType<Exclude<Props, Promise<any>>>
              : never;

            export type ResolverObject = {
              [key: PropertyKey]: Resolver<any, any, any> | Resolver<any, any, any, any>;
            };

            export type ResolveKey<
              TModel extends object,
              TResolvers extends ResolverObject,
              TItem,
              TKey,
              TOmittedElement = TKey extends keyof TItem
                ? Omit<
                    NonNullable<TItem[TKey]>,
                    \\"where\\" | \\"directed\\" | \\"options\\" | \\"after\\" | \\"first\\" | \\"sort\\"
                  >
                : never
            > = TKey extends keyof TModel
              ? NonNullable<TModel[TKey]> extends Primitive
                ? TModel[TKey]
                : ResolverReturnType<TModel, TKey, TResolvers> extends {
                    Model: infer NestedTModel;
                    Resolvers: infer NestedResolvers;
                  }
                ? NestedTModel extends object
                  ? NestedResolvers extends ResolverObject
                    ? TKey extends keyof TItem
                      ? \\"on\\" extends keyof TOmittedElement
                        ?
                            | ({
                                -readonly [key in keyof TOmittedElement[\\"on\\"]]: StripNeverKeysAddTypename<
                                  {
                                    -readonly [K in keyof TOmittedElement[\\"on\\"][key]]: K extends keyof NestedTModel
                                      ? NestedTModel[K] extends any[]
                                        ? MagicArray<
                                            ResolveKey<
                                              NestedTModel,
                                              NestedResolvers,
                                              TOmittedElement[\\"on\\"][key],
                                              K
                                            >[]
                                          >
                                        : ResolveKey<
                                            NestedTModel,
                                            NestedResolvers,
                                            TOmittedElement[\\"on\\"][key],
                                            K
                                          >
                                      : never;
                                  },
                                  key
                                >;
                              }[keyof TOmittedElement[\\"on\\"]] &
                                ResolveKey<
                                  TModel,
                                  TResolvers,
                                  Omit<TItem, TKey> & {
                                    [key in TKey]: Omit<TOmittedElement, \\"on\\">;
                                  },
                                  TKey
                                >)
                            | (undefined extends TModel[TKey]
                                ? NonNullable<TModel[TKey]> extends any[]
                                  ? never
                                  : undefined
                                : never)
                            | (undefined extends TItem[TKey]
                                ? NonNullable<TModel[TKey]> extends any[]
                                  ? never
                                  : undefined
                                : never)
                        : ClearObjectWithNeverKeys<
                            | {
                                -readonly [key in keyof TOmittedElement as key extends keyof NestedTModel
                                  ? key
                                  : never]: key extends keyof NestedTModel
                                  ? NestedTModel[key] extends any[]
                                    ? MagicArray<
                                        ResolveKey<
                                          NestedTModel,
                                          NestedResolvers,
                                          TOmittedElement,
                                          key
                                        >[]
                                      >
                                    : ResolveKey<
                                        NestedTModel,
                                        NestedResolvers,
                                        TOmittedElement,
                                        key
                                      >
                                  : never;
                              }
                            | (undefined extends TModel[TKey]
                                ? NonNullable<TModel[TKey]> extends any[]
                                  ? never
                                  : undefined
                                : never)
                            | (undefined extends TItem[TKey]
                                ? NonNullable<TModel[TKey]> extends any[]
                                  ? never
                                  : undefined
                                : never)
                          >
                      : never
                    : never
                  : TModel[TKey] extends (infer TArrayItem)[]
                  ? NonNullable<TArrayItem> extends Primitive
                    ? TArrayItem
                    : never
                  : never
                : never
              : never;

            //Only if TValue = any, this is true
            export type IsAny<TValue> = unknown extends TValue ? true : false;

            export type NestedBooleanObject<
              TModel extends object,
              TResolvers extends ResolverObject,
              TKey extends keyof TModel,
              TElement,
              RequiredValue extends NonNullable<TElement> = NonNullable<TElement>
            > = IsAny<RequiredValue> extends true
              ? boolean
              : RequiredValue extends object
              ? RequiredValue extends (infer TItem)[]
                ? NonNullable<TItem> extends Primitive
                  ? boolean
                  : {
                      [key in keyof TItem]?: ResolverReturnType<
                        TModel,
                        TKey,
                        TResolvers
                      > extends {
                        Model: infer NestedModel;
                        Resolvers: infer NestedResolvers;
                      }
                        ? NestedModel extends object
                          ? NestedResolvers extends ResolverObject
                            ? key extends keyof NestedModel
                              ? NonNullable<TItem[key]> extends object
                                ? NonNullable<TItem[key]> extends any[]
                                  ? NestedBooleanObject<
                                      NestedModel,
                                      NestedResolvers,
                                      key,
                                      NonNullable<NonNullable<TItem>[key]>
                                    >
                                  : IsAny<NonNullable<TItem[key]>> extends true
                                  ? boolean
                                  : \\"__typename\\" extends keyof NonNullable<TItem[key]>
                                  ? NestedBooleanObject<
                                      NestedModel,
                                      NestedResolvers,
                                      key,
                                      UnionToIntersection<
                                        Omit<
                                          NonNullable<NonNullable<TItem>[key]>,
                                          \\"__typename\\"
                                        >
                                      > & {
                                        __typename: NonNullable<
                                          NonNullable<TItem[key]>[\\"__typename\\"]
                                        >;
                                      }
                                    >
                                  : never
                                : boolean
                              : never
                            : never
                          : never
                        : never;
                    } & ResolverArgs<TModel, TKey, TResolvers> &
                      BooleanOn<TElement>
                : {
                    [key in keyof RequiredValue]?: ResolverReturnType<
                      TModel,
                      TKey,
                      TResolvers
                    > extends { Model: infer NestedModel; Resolvers: infer NestedResolvers }
                      ? NestedModel extends object
                        ? NestedResolvers extends ResolverObject
                          ? key extends keyof NestedModel
                            ? NonNullable<RequiredValue[key]> extends any[]
                              ? NestedBooleanObject<
                                  NestedModel,
                                  NestedResolvers,
                                  key,
                                  NonNullable<RequiredValue[key]>
                                >
                              : NonNullable<RequiredValue[key]> extends object
                              ? IsAny<NonNullable<RequiredValue[key]>> extends true
                                ? boolean
                                : \\"__typename\\" extends keyof NonNullable<RequiredValue[key]>
                                ? NestedBooleanObject<
                                    NestedModel,
                                    NestedResolvers,
                                    key,
                                    UnionToIntersection<
                                      Omit<NonNullable<RequiredValue[key]>, \\"__typename\\">
                                    > & {
                                      __typename: NonNullable<
                                        NonNullable<RequiredValue[key]>[\\"__typename\\"]
                                      >;
                                    }
                                  >
                                : never
                              : boolean
                            : never
                          : never
                        : never
                      : never;
                  } & BooleanOn<TElement> &
                    ResolverArgs<TModel, TKey, TResolvers>
              : boolean;

            export type SelectionSetObject<
              TModel extends object,
              TResolvers extends ResolverObject
            > = {
              [key in keyof TModel]?: NonNullable<TModel[key]> extends Primitive
                ? boolean
                : NonNullable<TModel[key]> extends (infer TItem)[]
                ? \\"__typename\\" extends keyof TItem
                  ? NestedBooleanObject<
                      TModel,
                      TResolvers,
                      key,
                      Prettify<
                        UnionToIntersection<Omit<NonNullable<TItem>, \\"__typename\\">> & {
                          __typename: NonNullable<NonNullable<TItem>[\\"__typename\\"]>;
                        }
                      >
                    >
                  : NonNullable<TItem> extends Primitive
                  ? boolean
                  : never
                : \\"__typename\\" extends keyof NonNullable<TModel[key]>
                ? NestedBooleanObject<
                    TModel,
                    TResolvers,
                    key,
                    Prettify<
                      UnionToIntersection<Omit<NonNullable<TModel[key]>, \\"__typename\\">> & {
                        __typename: NonNullable<NonNullable<TModel[key]>[\\"__typename\\"]>;
                      }
                    >
                  >
                : never;
            };

            type BooleanOn<TElement> = TElement extends { __typename: infer Typename }
              ? TuplifyUnion<NonNullable<Typename>>[\\"length\\"] extends 1
                ? {}
                : NonNullable<Typename> extends string
                ? {
                    on?: {
                      [key in NonNullable<Typename>]?: key extends keyof RequiredResolvers
                        ? key extends keyof ResolversTypes
                          ? Omit<
                              RequiredResolvers[key],
                              \\"__isTypeOf\\"
                            > extends ResolverObject
                            ? {
                                [K in keyof NonNullable<
                                  Exclude<ResolversTypes[key], Promise<any>>
                                >]?: NestedBooleanObject<
                                  NonNullable<Exclude<ResolversTypes[key], Promise<any>>>,
                                  Omit<RequiredResolvers[key], \\"__isTypeOf\\">,
                                  K,
                                  NonNullable<Exclude<ResolversTypes[key], Promise<any>>>[K]
                                >;
                              }
                            : never
                          : never
                        : never;
                    };
                  }
                : never
              : {};

            export type InferFromSelectionSetObject<
              TModel extends object,
              TResolvers extends ResolverObject,
              TSelectionSet extends SelectionSetObject<TModel, TResolvers>
            > = MagicObject<{
              -readonly [key in keyof TSelectionSet]: key extends keyof TModel
                ? NonNullable<TModel[key]> extends any[]
                  ?
                      | ResolveKey<TModel, TResolvers, TSelectionSet, key>[]
                      | (undefined extends TModel[key] ? undefined : never)
                  :
                      | ResolveKey<TModel, TResolvers, TSelectionSet, key>
                      | (undefined extends TModel[key] ? undefined : never)
                : never;
            }>;
            import { GraphQLResolveInfo } from \\"graphql\\";
            export type Maybe<T> = T | null;
            export type InputMaybe<T> = Maybe<T>;
            export type Exact<T extends { [key: string]: unknown }> = {
              [K in keyof T]: T[K];
            };
            export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
              [SubKey in K]?: Maybe<T[SubKey]>;
            };
            export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
              [SubKey in K]: Maybe<T[SubKey]>;
            };
            export type MakeEmpty<
              T extends { [key: string]: unknown },
              K extends keyof T
            > = { [_ in K]?: never };
            export type Incremental<T> =
              | T
              | {
                  [P in keyof T]?: P extends \\" $fragmentName\\" | \\"__typename\\" ? T[P] : never;
                };
            export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
              [P in K]-?: NonNullable<T[P]>;
            };
            /** All built-in and custom scalars, mapped to their actual values */
            export type Scalars = {
              ID: { input: string; output: string };
              /** The \`String\` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text. */
              String: { input: string; output: string };
              /** The \`Boolean\` scalar type represents \`true\` or \`false\`. */
              Boolean: { input: boolean; output: boolean };
              /** The \`Int\` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. */
              Int: { input: number; output: number };
              Float: { input: number; output: number };
            };

            export type Query = {
              __typename?: \\"Query\\";
              users: Array<User>;
              usersConnection: UsersConnection;
              usersAggregate: UserAggregateSelection;
            };

            export type QueryUsersArgs = {
              where?: InputMaybe<UserWhere>;
              options?: InputMaybe<UserOptions>;
            };

            export type QueryUsersConnectionArgs = {
              first?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              after?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              where?: InputMaybe<UserWhere>;
              sort?: InputMaybe<Array<InputMaybe<UserSort>>>;
            };

            export type QueryUsersAggregateArgs = {
              where?: InputMaybe<UserWhere>;
            };

            export type Mutation = {
              __typename?: \\"Mutation\\";
              createUsers: CreateUsersMutationResponse;
              deleteUsers: DeleteInfo;
              updateUsers: UpdateUsersMutationResponse;
            };

            export type MutationCreateUsersArgs = {
              input: Array<UserCreateInput>;
            };

            export type MutationDeleteUsersArgs = {
              where?: InputMaybe<UserWhere>;
            };

            export type MutationUpdateUsersArgs = {
              where?: InputMaybe<UserWhere>;
              update?: InputMaybe<UserUpdateInput>;
            };

            /** An enum for sorting in either ascending or descending order. */
            export enum SortDirection {
              /** Sort by field values in ascending order. */
              Asc = \\"ASC\\",
              /** Sort by field values in descending order. */
              Desc = \\"DESC\\",
            }

            /** Information about the number of nodes and relationships created during a create mutation */
            export type CreateInfo = {
              __typename?: \\"CreateInfo\\";
              /** @deprecated This field has been deprecated because bookmarks are now handled by the driver. */
              bookmark?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              nodesCreated: Scalars[\\"Int\\"][\\"output\\"];
              relationshipsCreated: Scalars[\\"Int\\"][\\"output\\"];
            };

            export type CreateUsersMutationResponse = {
              __typename?: \\"CreateUsersMutationResponse\\";
              info: CreateInfo;
              users: Array<User>;
            };

            /** Information about the number of nodes and relationships deleted during a delete mutation */
            export type DeleteInfo = {
              __typename?: \\"DeleteInfo\\";
              /** @deprecated This field has been deprecated because bookmarks are now handled by the driver. */
              bookmark?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              nodesDeleted: Scalars[\\"Int\\"][\\"output\\"];
              relationshipsDeleted: Scalars[\\"Int\\"][\\"output\\"];
            };

            /** Pagination information (Relay) */
            export type PageInfo = {
              __typename?: \\"PageInfo\\";
              hasNextPage: Scalars[\\"Boolean\\"][\\"output\\"];
              hasPreviousPage: Scalars[\\"Boolean\\"][\\"output\\"];
              startCursor?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              endCursor?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
            };

            export type StringAggregateSelection = {
              __typename?: \\"StringAggregateSelection\\";
              shortest?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              longest?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
            };

            /** Information about the number of nodes and relationships created and deleted during an update mutation */
            export type UpdateInfo = {
              __typename?: \\"UpdateInfo\\";
              /** @deprecated This field has been deprecated because bookmarks are now handled by the driver. */
              bookmark?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              nodesCreated: Scalars[\\"Int\\"][\\"output\\"];
              nodesDeleted: Scalars[\\"Int\\"][\\"output\\"];
              relationshipsCreated: Scalars[\\"Int\\"][\\"output\\"];
              relationshipsDeleted: Scalars[\\"Int\\"][\\"output\\"];
            };

            export type UpdateUsersMutationResponse = {
              __typename?: \\"UpdateUsersMutationResponse\\";
              info: UpdateInfo;
              users: Array<User>;
            };

            export type User = {
              __typename?: \\"User\\";
              name?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
            };

            export type UserAggregateSelection = {
              __typename?: \\"UserAggregateSelection\\";
              count: Scalars[\\"Int\\"][\\"output\\"];
              name: StringAggregateSelection;
            };

            export type UserEdge = {
              __typename?: \\"UserEdge\\";
              cursor: Scalars[\\"String\\"][\\"output\\"];
              node: User;
            };

            export type UsersConnection = {
              __typename?: \\"UsersConnection\\";
              totalCount: Scalars[\\"Int\\"][\\"output\\"];
              pageInfo: PageInfo;
              edges: Array<UserEdge>;
            };

            export type UserCreateInput = {
              name?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
            };

            export type UserOptions = {
              limit?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              offset?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** Specify one or more UserSort objects to sort Users by. The sorts will be applied in the order in which they are arranged in the array. */
              sort?: InputMaybe<Array<UserSort>>;
            };

            /** Fields to sort Users by. The order in which sorts are applied is not guaranteed when specifying many fields in one UserSort object. */
            export type UserSort = {
              name?: InputMaybe<SortDirection>;
            };

            export type UserUpdateInput = {
              name?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
            };

            export type UserWhere = {
              name?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              name_IN?: InputMaybe<Array<InputMaybe<Scalars[\\"String\\"][\\"input\\"]>>>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT_IN?: InputMaybe<Array<InputMaybe<Scalars[\\"String\\"][\\"input\\"]>>>;
              name_CONTAINS?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              name_STARTS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              name_ENDS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT_CONTAINS?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT_STARTS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT_ENDS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              OR?: InputMaybe<Array<UserWhere>>;
              AND?: InputMaybe<Array<UserWhere>>;
              NOT?: InputMaybe<UserWhere>;
            };

            export type ResolverTypeWrapper<T> = Promise<T> | T;

            export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
              resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
            };
            export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
              | ResolverFn<TResult, TParent, TContext, TArgs>
              | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

            export type ResolverFn<TResult, TParent, TContext, TArgs> = (
              parent: TParent,
              args: TArgs,
              context: TContext,
              info: GraphQLResolveInfo
            ) => Promise<TResult> | TResult;

            export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
              parent: TParent,
              args: TArgs,
              context: TContext,
              info: GraphQLResolveInfo
            ) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

            export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
              parent: TParent,
              args: TArgs,
              context: TContext,
              info: GraphQLResolveInfo
            ) => TResult | Promise<TResult>;

            export interface SubscriptionSubscriberObject<
              TResult,
              TKey extends string,
              TParent,
              TContext,
              TArgs
            > {
              subscribe: SubscriptionSubscribeFn<
                { [key in TKey]: TResult },
                TParent,
                TContext,
                TArgs
              >;
              resolve?: SubscriptionResolveFn<
                TResult,
                { [key in TKey]: TResult },
                TContext,
                TArgs
              >;
            }

            export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
              subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
              resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
            }

            export type SubscriptionObject<
              TResult,
              TKey extends string,
              TParent,
              TContext,
              TArgs
            > =
              | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
              | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

            export type SubscriptionResolver<
              TResult,
              TKey extends string,
              TParent = {},
              TContext = {},
              TArgs = {}
            > =
              | ((
                  ...args: any[]
                ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
              | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

            export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
              parent: TParent,
              context: TContext,
              info: GraphQLResolveInfo
            ) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

            export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
              obj: T,
              context: TContext,
              info: GraphQLResolveInfo
            ) => boolean | Promise<boolean>;

            export type NextResolverFn<T> = () => Promise<T>;

            export type DirectiveResolverFn<
              TResult = {},
              TParent = {},
              TContext = {},
              TArgs = {}
            > = (
              next: NextResolverFn<TResult>,
              parent: TParent,
              args: TArgs,
              context: TContext,
              info: GraphQLResolveInfo
            ) => TResult | Promise<TResult>;

            /** Mapping between all available schema types and the resolvers types */
            export type ResolversTypes = {
              Query: ResolverTypeWrapper<{}>;
              Int: ResolverTypeWrapper<Scalars[\\"Int\\"][\\"output\\"]>;
              String: ResolverTypeWrapper<Scalars[\\"String\\"][\\"output\\"]>;
              Mutation: ResolverTypeWrapper<{}>;
              SortDirection: SortDirection;
              CreateInfo: ResolverTypeWrapper<CreateInfo>;
              CreateUsersMutationResponse: ResolverTypeWrapper<CreateUsersMutationResponse>;
              DeleteInfo: ResolverTypeWrapper<DeleteInfo>;
              PageInfo: ResolverTypeWrapper<PageInfo>;
              Boolean: ResolverTypeWrapper<Scalars[\\"Boolean\\"][\\"output\\"]>;
              StringAggregateSelection: ResolverTypeWrapper<StringAggregateSelection>;
              UpdateInfo: ResolverTypeWrapper<UpdateInfo>;
              UpdateUsersMutationResponse: ResolverTypeWrapper<UpdateUsersMutationResponse>;
              User: ResolverTypeWrapper<User>;
              UserAggregateSelection: ResolverTypeWrapper<UserAggregateSelection>;
              UserEdge: ResolverTypeWrapper<UserEdge>;
              UsersConnection: ResolverTypeWrapper<UsersConnection>;
              UserCreateInput: UserCreateInput;
              UserOptions: UserOptions;
              UserSort: UserSort;
              UserUpdateInput: UserUpdateInput;
              UserWhere: UserWhere;
            };

            /** Mapping between all available schema types and the resolvers parents */
            export type ResolversParentTypes = {
              Query: {};
              Int: Scalars[\\"Int\\"][\\"output\\"];
              String: Scalars[\\"String\\"][\\"output\\"];
              Mutation: {};
              CreateInfo: CreateInfo;
              CreateUsersMutationResponse: CreateUsersMutationResponse;
              DeleteInfo: DeleteInfo;
              PageInfo: PageInfo;
              Boolean: Scalars[\\"Boolean\\"][\\"output\\"];
              StringAggregateSelection: StringAggregateSelection;
              UpdateInfo: UpdateInfo;
              UpdateUsersMutationResponse: UpdateUsersMutationResponse;
              User: User;
              UserAggregateSelection: UserAggregateSelection;
              UserEdge: UserEdge;
              UsersConnection: UsersConnection;
              UserCreateInput: UserCreateInput;
              UserOptions: UserOptions;
              UserSort: UserSort;
              UserUpdateInput: UserUpdateInput;
              UserWhere: UserWhere;
            };

            export type QueryResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"Query\\"] = ResolversParentTypes[\\"Query\\"]
            > = {
              users?: Resolver<
                Array<ResolversTypes[\\"User\\"]>,
                ParentType,
                ContextType,
                Partial<QueryUsersArgs>
              >;
              usersConnection?: Resolver<
                ResolversTypes[\\"UsersConnection\\"],
                ParentType,
                ContextType,
                Partial<QueryUsersConnectionArgs>
              >;
              usersAggregate?: Resolver<
                ResolversTypes[\\"UserAggregateSelection\\"],
                ParentType,
                ContextType,
                Partial<QueryUsersAggregateArgs>
              >;
            };

            export type MutationResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"Mutation\\"] = ResolversParentTypes[\\"Mutation\\"]
            > = {
              createUsers?: Resolver<
                ResolversTypes[\\"CreateUsersMutationResponse\\"],
                ParentType,
                ContextType,
                RequireFields<MutationCreateUsersArgs, \\"input\\">
              >;
              deleteUsers?: Resolver<
                ResolversTypes[\\"DeleteInfo\\"],
                ParentType,
                ContextType,
                Partial<MutationDeleteUsersArgs>
              >;
              updateUsers?: Resolver<
                ResolversTypes[\\"UpdateUsersMutationResponse\\"],
                ParentType,
                ContextType,
                Partial<MutationUpdateUsersArgs>
              >;
            };

            export type CreateInfoResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"CreateInfo\\"] = ResolversParentTypes[\\"CreateInfo\\"]
            > = {
              bookmark?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              nodesCreated?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              relationshipsCreated?: Resolver<
                ResolversTypes[\\"Int\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type CreateUsersMutationResponseResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"CreateUsersMutationResponse\\"] = ResolversParentTypes[\\"CreateUsersMutationResponse\\"]
            > = {
              info?: Resolver<ResolversTypes[\\"CreateInfo\\"], ParentType, ContextType>;
              users?: Resolver<Array<ResolversTypes[\\"User\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type DeleteInfoResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"DeleteInfo\\"] = ResolversParentTypes[\\"DeleteInfo\\"]
            > = {
              bookmark?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              nodesDeleted?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              relationshipsDeleted?: Resolver<
                ResolversTypes[\\"Int\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type PageInfoResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"PageInfo\\"] = ResolversParentTypes[\\"PageInfo\\"]
            > = {
              hasNextPage?: Resolver<ResolversTypes[\\"Boolean\\"], ParentType, ContextType>;
              hasPreviousPage?: Resolver<
                ResolversTypes[\\"Boolean\\"],
                ParentType,
                ContextType
              >;
              startCursor?: Resolver<
                Maybe<ResolversTypes[\\"String\\"]>,
                ParentType,
                ContextType
              >;
              endCursor?: Resolver<
                Maybe<ResolversTypes[\\"String\\"]>,
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type StringAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"StringAggregateSelection\\"] = ResolversParentTypes[\\"StringAggregateSelection\\"]
            > = {
              shortest?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              longest?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UpdateInfoResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UpdateInfo\\"] = ResolversParentTypes[\\"UpdateInfo\\"]
            > = {
              bookmark?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              nodesCreated?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              nodesDeleted?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              relationshipsCreated?: Resolver<
                ResolversTypes[\\"Int\\"],
                ParentType,
                ContextType
              >;
              relationshipsDeleted?: Resolver<
                ResolversTypes[\\"Int\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UpdateUsersMutationResponseResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UpdateUsersMutationResponse\\"] = ResolversParentTypes[\\"UpdateUsersMutationResponse\\"]
            > = {
              info?: Resolver<ResolversTypes[\\"UpdateInfo\\"], ParentType, ContextType>;
              users?: Resolver<Array<ResolversTypes[\\"User\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UserResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"User\\"] = ResolversParentTypes[\\"User\\"]
            > = {
              name?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UserAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UserAggregateSelection\\"] = ResolversParentTypes[\\"UserAggregateSelection\\"]
            > = {
              count?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              name?: Resolver<
                ResolversTypes[\\"StringAggregateSelection\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UserEdgeResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UserEdge\\"] = ResolversParentTypes[\\"UserEdge\\"]
            > = {
              cursor?: Resolver<ResolversTypes[\\"String\\"], ParentType, ContextType>;
              node?: Resolver<ResolversTypes[\\"User\\"], ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UsersConnectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UsersConnection\\"] = ResolversParentTypes[\\"UsersConnection\\"]
            > = {
              totalCount?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              pageInfo?: Resolver<ResolversTypes[\\"PageInfo\\"], ParentType, ContextType>;
              edges?: Resolver<Array<ResolversTypes[\\"UserEdge\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type Resolvers<ContextType = any> = {
              Query?: QueryResolvers<ContextType>;
              Mutation?: MutationResolvers<ContextType>;
              CreateInfo?: CreateInfoResolvers<ContextType>;
              CreateUsersMutationResponse?: CreateUsersMutationResponseResolvers<ContextType>;
              DeleteInfo?: DeleteInfoResolvers<ContextType>;
              PageInfo?: PageInfoResolvers<ContextType>;
              StringAggregateSelection?: StringAggregateSelectionResolvers<ContextType>;
              UpdateInfo?: UpdateInfoResolvers<ContextType>;
              UpdateUsersMutationResponse?: UpdateUsersMutationResponseResolvers<ContextType>;
              User?: UserResolvers<ContextType>;
              UserAggregateSelection?: UserAggregateSelectionResolvers<ContextType>;
              UserEdge?: UserEdgeResolvers<ContextType>;
              UsersConnection?: UsersConnectionResolvers<ContextType>;
            };

            export interface UserAggregateSelectionInput {
              count?: boolean;
              name?: boolean;
            }

            export type UserSelectionSet = SelectionSetObject<User, UserResolvers>;
            export type InferFromUserSelectionSet<TSelectionSet extends UserSelectionSet> =
              InferFromSelectionSetObject<User, UserResolvers, TSelectionSet>;

            export declare class UserModel {
              public find(args?: {
                where?: UserWhere;

                options?: UserOptions;
                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<User[]>;
              public findSafe<TSelectionSet extends UserSelectionSet>(args?: {
                where?: UserWhere;

                options?: UserOptions;
                selectionSet?: TSelectionSet;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<Prettify<InferFromUserSelectionSet<TSelectionSet>>[]>;
              public create(args: {
                input: UserCreateInput[];
                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<CreateUsersMutationResponse>;
              public update(args: {
                where?: UserWhere;
                update?: UserUpdateInput;

                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<UpdateUsersMutationResponse>;
              public delete(args: {
                where?: UserWhere;

                context?: any;
                rootValue?: any;
              }): Promise<{ nodesDeleted: number; relationshipsDeleted: number }>;
              public aggregate(args: {
                where?: UserWhere;

                aggregate: UserAggregateSelectionInput;
                context?: any;
                rootValue?: any;
              }): Promise<UserAggregateSelection>;
            }

            export interface ModelMap {
              User: UserModel;
            }
            "
        `);
    });

    test("should generate simple types of a single node with fulltext directive and return the string", async () => {
        const typeDefs = `
            type User {
                name: String
            }

            extend type User @fulltext(indexes: [{ name: "UserName", fields: ["name"] }])
        `;

        const ogm = new OGM({
            typeDefs,
            // @ts-ignore
            driver: {},
        });

        const generated = (await generate({
            ogm,
            noWrite: true,
        })) as string;

        expect(generated).toMatchInlineSnapshot(`
            "import type { SelectionSetNode, DocumentNode } from \\"graphql\\";
            import type { RawGQL } from \\"@efebia/neo4j-graphql-ogm\\";
            export type RequiredResolvers = Required<Resolvers>;
            export type Primitive = string | number | boolean;
            export type Prettify<T> = {
              [K in keyof T]: T[K];
            } & {};
            export type AddRawGQL<T> = NonNullable<T> extends (infer TItem)[]
              ? (TItem | RawGQL)[]
              : NonNullable<T> extends Primitive
              ? T
              : IsAny<NonNullable<T>> extends true
              ? T
              : {
                  [key in keyof T]: AddRawGQL<T[key]> | RawGQL;
                };

            export type AddRawGQLToOptions<TProps> = TProps extends { where?: infer TWhere }
              ? {
                  where?: AddRawGQL<NonNullable<TWhere>>;
                } & AddRawGQLToOptions<Omit<TProps, \\"where\\">>
              : TProps extends { sort?: infer TSort }
              ? {
                  sort?: NonNullable<TSort> extends (infer TItem)[]
                    ? AddRawGQL<NonNullable<TItem>>[]
                    : never;
                }
              : {};

            export type ResolverArgs<
              TModel extends object,
              TKey extends keyof TModel,
              TResolvers extends { [key: PropertyKey]: Resolver<any, any, any, any> }
            > = TModel[TKey] extends Primitive
              ? never
              : NonNullable<TResolvers[TKey]> extends Resolver<any, any, any, infer Props>
              ? \\"directed\\" extends keyof Props
                ? Omit<Props, \\"directed\\" | \\"where\\" | \\"sort\\"> & {
                    directed?: boolean;
                  } & AddRawGQLToOptions<Props>
                : {}
              : {};

            export type UnionToIntersection<U> = (
              U extends any ? (k: U) => void : never
            ) extends (k: infer I) => void
              ? I
              : never;
            type LastOf<T> = UnionToIntersection<
              T extends any ? () => T : never
            > extends () => infer R
              ? R
              : never;

            type Push<T extends any[], V> = [...T, V];

            export type TuplifyUnion<
              T,
              L = LastOf<T>,
              N = [T] extends [never] ? true : false
            > = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>;

            // This is pure magic
            export type MagicArray<TArray extends any[]> =
              NonNullable<TArray> extends (infer TItem)[] ? TItem[] : never;
            export type MagicObject<TElement> =
              NonNullable<TElement> extends (infer TItem)[]
                ? TItem[]
                : NonNullable<TElement> extends Primitive
                ? TElement
                : {
                    [key in keyof TElement as TElement[key] extends never
                      ? never
                      : key]: MagicObject<TElement[key]>;
                  };

            export type StripNeverKeys<TElement> = TElement extends object
              ? {
                  [key in keyof TElement as [TElement[key]] extends [never]
                    ? never
                    : TElement[key] extends never[]
                    ? never
                    : key]: TElement[key];
                }
              : TElement;

            export type ClearObjectWithNeverKeys<
              TElement,
              TStripped = StripNeverKeys<TElement>
            > = [keyof Omit<TElement, keyof TStripped>] extends [never] ? TStripped : never;

            export type StripNeverKeysAddTypename<
              TElement,
              TKey,
              TStripped = ClearObjectWithNeverKeys<TElement>
            > = [keyof TStripped] extends [never]
              ? never
              : TStripped & { __typename: TKey };

            type RetrieveType<TItem> = Exclude<
              TItem,
              Promise<any>
            > extends ResolverTypeWrapper<infer TValue>
              ? TValue extends { __typename?: infer TName }
                ? TItem extends object
                  ? TName extends keyof Resolvers
                    ? \\"__isTypeOf\\" extends keyof RequiredResolvers[TName]
                      ? Omit<RequiredResolvers[TName], \\"__isTypeOf\\"> extends {
                          [key: string]: Resolver<any, any, any, any>;
                        }
                        ? {
                            Model: Exclude<TItem, Promise<any>>;
                            Resolvers: Omit<RequiredResolvers[TName], \\"__isTypeOf\\">;
                          }
                        : never
                      : never
                    : never
                  : never
                : never
              : never;

            export type ResolverReturnType<
              TModel extends object,
              TKey extends keyof TModel,
              TResolvers extends { [key: PropertyKey]: Resolver<any, any, any, any> }
            > = TModel[TKey] extends Primitive
              ? never
              : NonNullable<TResolvers[TKey]> extends Resolver<infer Props, any, any, any>
              ? Props extends (infer TItem)[]
                ? RetrieveType<Exclude<TItem, Promise<any>>>
                : RetrieveType<Exclude<Props, Promise<any>>>
              : never;

            export type ResolverObject = {
              [key: PropertyKey]: Resolver<any, any, any> | Resolver<any, any, any, any>;
            };

            export type ResolveKey<
              TModel extends object,
              TResolvers extends ResolverObject,
              TItem,
              TKey,
              TOmittedElement = TKey extends keyof TItem
                ? Omit<
                    NonNullable<TItem[TKey]>,
                    \\"where\\" | \\"directed\\" | \\"options\\" | \\"after\\" | \\"first\\" | \\"sort\\"
                  >
                : never
            > = TKey extends keyof TModel
              ? NonNullable<TModel[TKey]> extends Primitive
                ? TModel[TKey]
                : ResolverReturnType<TModel, TKey, TResolvers> extends {
                    Model: infer NestedTModel;
                    Resolvers: infer NestedResolvers;
                  }
                ? NestedTModel extends object
                  ? NestedResolvers extends ResolverObject
                    ? TKey extends keyof TItem
                      ? \\"on\\" extends keyof TOmittedElement
                        ?
                            | ({
                                -readonly [key in keyof TOmittedElement[\\"on\\"]]: StripNeverKeysAddTypename<
                                  {
                                    -readonly [K in keyof TOmittedElement[\\"on\\"][key]]: K extends keyof NestedTModel
                                      ? NestedTModel[K] extends any[]
                                        ? MagicArray<
                                            ResolveKey<
                                              NestedTModel,
                                              NestedResolvers,
                                              TOmittedElement[\\"on\\"][key],
                                              K
                                            >[]
                                          >
                                        : ResolveKey<
                                            NestedTModel,
                                            NestedResolvers,
                                            TOmittedElement[\\"on\\"][key],
                                            K
                                          >
                                      : never;
                                  },
                                  key
                                >;
                              }[keyof TOmittedElement[\\"on\\"]] &
                                ResolveKey<
                                  TModel,
                                  TResolvers,
                                  Omit<TItem, TKey> & {
                                    [key in TKey]: Omit<TOmittedElement, \\"on\\">;
                                  },
                                  TKey
                                >)
                            | (undefined extends TModel[TKey]
                                ? NonNullable<TModel[TKey]> extends any[]
                                  ? never
                                  : undefined
                                : never)
                            | (undefined extends TItem[TKey]
                                ? NonNullable<TModel[TKey]> extends any[]
                                  ? never
                                  : undefined
                                : never)
                        : ClearObjectWithNeverKeys<
                            | {
                                -readonly [key in keyof TOmittedElement as key extends keyof NestedTModel
                                  ? key
                                  : never]: key extends keyof NestedTModel
                                  ? NestedTModel[key] extends any[]
                                    ? MagicArray<
                                        ResolveKey<
                                          NestedTModel,
                                          NestedResolvers,
                                          TOmittedElement,
                                          key
                                        >[]
                                      >
                                    : ResolveKey<
                                        NestedTModel,
                                        NestedResolvers,
                                        TOmittedElement,
                                        key
                                      >
                                  : never;
                              }
                            | (undefined extends TModel[TKey]
                                ? NonNullable<TModel[TKey]> extends any[]
                                  ? never
                                  : undefined
                                : never)
                            | (undefined extends TItem[TKey]
                                ? NonNullable<TModel[TKey]> extends any[]
                                  ? never
                                  : undefined
                                : never)
                          >
                      : never
                    : never
                  : TModel[TKey] extends (infer TArrayItem)[]
                  ? NonNullable<TArrayItem> extends Primitive
                    ? TArrayItem
                    : never
                  : never
                : never
              : never;

            //Only if TValue = any, this is true
            export type IsAny<TValue> = unknown extends TValue ? true : false;

            export type NestedBooleanObject<
              TModel extends object,
              TResolvers extends ResolverObject,
              TKey extends keyof TModel,
              TElement,
              RequiredValue extends NonNullable<TElement> = NonNullable<TElement>
            > = IsAny<RequiredValue> extends true
              ? boolean
              : RequiredValue extends object
              ? RequiredValue extends (infer TItem)[]
                ? NonNullable<TItem> extends Primitive
                  ? boolean
                  : {
                      [key in keyof TItem]?: ResolverReturnType<
                        TModel,
                        TKey,
                        TResolvers
                      > extends {
                        Model: infer NestedModel;
                        Resolvers: infer NestedResolvers;
                      }
                        ? NestedModel extends object
                          ? NestedResolvers extends ResolverObject
                            ? key extends keyof NestedModel
                              ? NonNullable<TItem[key]> extends object
                                ? NonNullable<TItem[key]> extends any[]
                                  ? NestedBooleanObject<
                                      NestedModel,
                                      NestedResolvers,
                                      key,
                                      NonNullable<NonNullable<TItem>[key]>
                                    >
                                  : IsAny<NonNullable<TItem[key]>> extends true
                                  ? boolean
                                  : \\"__typename\\" extends keyof NonNullable<TItem[key]>
                                  ? NestedBooleanObject<
                                      NestedModel,
                                      NestedResolvers,
                                      key,
                                      UnionToIntersection<
                                        Omit<
                                          NonNullable<NonNullable<TItem>[key]>,
                                          \\"__typename\\"
                                        >
                                      > & {
                                        __typename: NonNullable<
                                          NonNullable<TItem[key]>[\\"__typename\\"]
                                        >;
                                      }
                                    >
                                  : never
                                : boolean
                              : never
                            : never
                          : never
                        : never;
                    } & ResolverArgs<TModel, TKey, TResolvers> &
                      BooleanOn<TElement>
                : {
                    [key in keyof RequiredValue]?: ResolverReturnType<
                      TModel,
                      TKey,
                      TResolvers
                    > extends { Model: infer NestedModel; Resolvers: infer NestedResolvers }
                      ? NestedModel extends object
                        ? NestedResolvers extends ResolverObject
                          ? key extends keyof NestedModel
                            ? NonNullable<RequiredValue[key]> extends any[]
                              ? NestedBooleanObject<
                                  NestedModel,
                                  NestedResolvers,
                                  key,
                                  NonNullable<RequiredValue[key]>
                                >
                              : NonNullable<RequiredValue[key]> extends object
                              ? IsAny<NonNullable<RequiredValue[key]>> extends true
                                ? boolean
                                : \\"__typename\\" extends keyof NonNullable<RequiredValue[key]>
                                ? NestedBooleanObject<
                                    NestedModel,
                                    NestedResolvers,
                                    key,
                                    UnionToIntersection<
                                      Omit<NonNullable<RequiredValue[key]>, \\"__typename\\">
                                    > & {
                                      __typename: NonNullable<
                                        NonNullable<RequiredValue[key]>[\\"__typename\\"]
                                      >;
                                    }
                                  >
                                : never
                              : boolean
                            : never
                          : never
                        : never
                      : never;
                  } & BooleanOn<TElement> &
                    ResolverArgs<TModel, TKey, TResolvers>
              : boolean;

            export type SelectionSetObject<
              TModel extends object,
              TResolvers extends ResolverObject
            > = {
              [key in keyof TModel]?: NonNullable<TModel[key]> extends Primitive
                ? boolean
                : NonNullable<TModel[key]> extends (infer TItem)[]
                ? \\"__typename\\" extends keyof TItem
                  ? NestedBooleanObject<
                      TModel,
                      TResolvers,
                      key,
                      Prettify<
                        UnionToIntersection<Omit<NonNullable<TItem>, \\"__typename\\">> & {
                          __typename: NonNullable<NonNullable<TItem>[\\"__typename\\"]>;
                        }
                      >
                    >
                  : NonNullable<TItem> extends Primitive
                  ? boolean
                  : never
                : \\"__typename\\" extends keyof NonNullable<TModel[key]>
                ? NestedBooleanObject<
                    TModel,
                    TResolvers,
                    key,
                    Prettify<
                      UnionToIntersection<Omit<NonNullable<TModel[key]>, \\"__typename\\">> & {
                        __typename: NonNullable<NonNullable<TModel[key]>[\\"__typename\\"]>;
                      }
                    >
                  >
                : never;
            };

            type BooleanOn<TElement> = TElement extends { __typename: infer Typename }
              ? TuplifyUnion<NonNullable<Typename>>[\\"length\\"] extends 1
                ? {}
                : NonNullable<Typename> extends string
                ? {
                    on?: {
                      [key in NonNullable<Typename>]?: key extends keyof RequiredResolvers
                        ? key extends keyof ResolversTypes
                          ? Omit<
                              RequiredResolvers[key],
                              \\"__isTypeOf\\"
                            > extends ResolverObject
                            ? {
                                [K in keyof NonNullable<
                                  Exclude<ResolversTypes[key], Promise<any>>
                                >]?: NestedBooleanObject<
                                  NonNullable<Exclude<ResolversTypes[key], Promise<any>>>,
                                  Omit<RequiredResolvers[key], \\"__isTypeOf\\">,
                                  K,
                                  NonNullable<Exclude<ResolversTypes[key], Promise<any>>>[K]
                                >;
                              }
                            : never
                          : never
                        : never;
                    };
                  }
                : never
              : {};

            export type InferFromSelectionSetObject<
              TModel extends object,
              TResolvers extends ResolverObject,
              TSelectionSet extends SelectionSetObject<TModel, TResolvers>
            > = MagicObject<{
              -readonly [key in keyof TSelectionSet]: key extends keyof TModel
                ? NonNullable<TModel[key]> extends any[]
                  ?
                      | ResolveKey<TModel, TResolvers, TSelectionSet, key>[]
                      | (undefined extends TModel[key] ? undefined : never)
                  :
                      | ResolveKey<TModel, TResolvers, TSelectionSet, key>
                      | (undefined extends TModel[key] ? undefined : never)
                : never;
            }>;
            import { GraphQLResolveInfo } from \\"graphql\\";
            export type Maybe<T> = T | null;
            export type InputMaybe<T> = Maybe<T>;
            export type Exact<T extends { [key: string]: unknown }> = {
              [K in keyof T]: T[K];
            };
            export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
              [SubKey in K]?: Maybe<T[SubKey]>;
            };
            export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
              [SubKey in K]: Maybe<T[SubKey]>;
            };
            export type MakeEmpty<
              T extends { [key: string]: unknown },
              K extends keyof T
            > = { [_ in K]?: never };
            export type Incremental<T> =
              | T
              | {
                  [P in keyof T]?: P extends \\" $fragmentName\\" | \\"__typename\\" ? T[P] : never;
                };
            export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
              [P in K]-?: NonNullable<T[P]>;
            };
            /** All built-in and custom scalars, mapped to their actual values */
            export type Scalars = {
              ID: { input: string; output: string };
              /** The \`String\` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text. */
              String: { input: string; output: string };
              /** The \`Boolean\` scalar type represents \`true\` or \`false\`. */
              Boolean: { input: boolean; output: boolean };
              /** The \`Int\` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. */
              Int: { input: number; output: number };
              /** The \`Float\` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point). */
              Float: { input: number; output: number };
            };

            export type Query = {
              __typename?: \\"Query\\";
              /** Query a full-text index. This query returns the query score, but does not allow for aggregations. Use the \`fulltext\` argument under other queries for this functionality. */
              usersFulltextUserName: Array<UserFulltextResult>;
              users: Array<User>;
              usersConnection: UsersConnection;
              usersAggregate: UserAggregateSelection;
            };

            export type QueryUsersFulltextUserNameArgs = {
              phrase: Scalars[\\"String\\"][\\"input\\"];
              where?: InputMaybe<UserFulltextWhere>;
              sort?: InputMaybe<Array<UserFulltextSort>>;
              limit?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              offset?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
            };

            export type QueryUsersArgs = {
              where?: InputMaybe<UserWhere>;
              options?: InputMaybe<UserOptions>;
              fulltext?: InputMaybe<UserFulltext>;
            };

            export type QueryUsersConnectionArgs = {
              first?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              after?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              where?: InputMaybe<UserWhere>;
              sort?: InputMaybe<Array<InputMaybe<UserSort>>>;
              fulltext?: InputMaybe<UserFulltext>;
            };

            export type QueryUsersAggregateArgs = {
              where?: InputMaybe<UserWhere>;
              fulltext?: InputMaybe<UserFulltext>;
            };

            export type Mutation = {
              __typename?: \\"Mutation\\";
              createUsers: CreateUsersMutationResponse;
              deleteUsers: DeleteInfo;
              updateUsers: UpdateUsersMutationResponse;
            };

            export type MutationCreateUsersArgs = {
              input: Array<UserCreateInput>;
            };

            export type MutationDeleteUsersArgs = {
              where?: InputMaybe<UserWhere>;
            };

            export type MutationUpdateUsersArgs = {
              where?: InputMaybe<UserWhere>;
              update?: InputMaybe<UserUpdateInput>;
            };

            /** An enum for sorting in either ascending or descending order. */
            export enum SortDirection {
              /** Sort by field values in ascending order. */
              Asc = \\"ASC\\",
              /** Sort by field values in descending order. */
              Desc = \\"DESC\\",
            }

            /** Information about the number of nodes and relationships created during a create mutation */
            export type CreateInfo = {
              __typename?: \\"CreateInfo\\";
              /** @deprecated This field has been deprecated because bookmarks are now handled by the driver. */
              bookmark?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              nodesCreated: Scalars[\\"Int\\"][\\"output\\"];
              relationshipsCreated: Scalars[\\"Int\\"][\\"output\\"];
            };

            export type CreateUsersMutationResponse = {
              __typename?: \\"CreateUsersMutationResponse\\";
              info: CreateInfo;
              users: Array<User>;
            };

            /** Information about the number of nodes and relationships deleted during a delete mutation */
            export type DeleteInfo = {
              __typename?: \\"DeleteInfo\\";
              /** @deprecated This field has been deprecated because bookmarks are now handled by the driver. */
              bookmark?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              nodesDeleted: Scalars[\\"Int\\"][\\"output\\"];
              relationshipsDeleted: Scalars[\\"Int\\"][\\"output\\"];
            };

            /** Pagination information (Relay) */
            export type PageInfo = {
              __typename?: \\"PageInfo\\";
              hasNextPage: Scalars[\\"Boolean\\"][\\"output\\"];
              hasPreviousPage: Scalars[\\"Boolean\\"][\\"output\\"];
              startCursor?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              endCursor?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
            };

            export type StringAggregateSelection = {
              __typename?: \\"StringAggregateSelection\\";
              shortest?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              longest?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
            };

            /** Information about the number of nodes and relationships created and deleted during an update mutation */
            export type UpdateInfo = {
              __typename?: \\"UpdateInfo\\";
              /** @deprecated This field has been deprecated because bookmarks are now handled by the driver. */
              bookmark?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              nodesCreated: Scalars[\\"Int\\"][\\"output\\"];
              nodesDeleted: Scalars[\\"Int\\"][\\"output\\"];
              relationshipsCreated: Scalars[\\"Int\\"][\\"output\\"];
              relationshipsDeleted: Scalars[\\"Int\\"][\\"output\\"];
            };

            export type UpdateUsersMutationResponse = {
              __typename?: \\"UpdateUsersMutationResponse\\";
              info: UpdateInfo;
              users: Array<User>;
            };

            export type User = {
              __typename?: \\"User\\";
              name?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
            };

            export type UserAggregateSelection = {
              __typename?: \\"UserAggregateSelection\\";
              count: Scalars[\\"Int\\"][\\"output\\"];
              name: StringAggregateSelection;
            };

            export type UserEdge = {
              __typename?: \\"UserEdge\\";
              cursor: Scalars[\\"String\\"][\\"output\\"];
              node: User;
            };

            /** The result of a fulltext search on an index of User */
            export type UserFulltextResult = {
              __typename?: \\"UserFulltextResult\\";
              score: Scalars[\\"Float\\"][\\"output\\"];
              user: User;
            };

            export type UsersConnection = {
              __typename?: \\"UsersConnection\\";
              totalCount: Scalars[\\"Int\\"][\\"output\\"];
              pageInfo: PageInfo;
              edges: Array<UserEdge>;
            };

            /** The input for filtering a float */
            export type FloatWhere = {
              min?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              max?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
            };

            export type UserCreateInput = {
              name?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
            };

            export type UserFulltext = {
              UserName?: InputMaybe<UserUserNameFulltext>;
            };

            /** The input for sorting a fulltext query on an index of User */
            export type UserFulltextSort = {
              score?: InputMaybe<SortDirection>;
              user?: InputMaybe<UserSort>;
            };

            /** The input for filtering a fulltext query on an index of User */
            export type UserFulltextWhere = {
              score?: InputMaybe<FloatWhere>;
              user?: InputMaybe<UserWhere>;
            };

            export type UserOptions = {
              limit?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              offset?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** Specify one or more UserSort objects to sort Users by. The sorts will be applied in the order in which they are arranged in the array. */
              sort?: InputMaybe<Array<UserSort>>;
            };

            /** Fields to sort Users by. The order in which sorts are applied is not guaranteed when specifying many fields in one UserSort object. */
            export type UserSort = {
              name?: InputMaybe<SortDirection>;
            };

            export type UserUpdateInput = {
              name?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
            };

            export type UserUserNameFulltext = {
              phrase: Scalars[\\"String\\"][\\"input\\"];
            };

            export type UserWhere = {
              name?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              name_IN?: InputMaybe<Array<InputMaybe<Scalars[\\"String\\"][\\"input\\"]>>>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT_IN?: InputMaybe<Array<InputMaybe<Scalars[\\"String\\"][\\"input\\"]>>>;
              name_CONTAINS?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              name_STARTS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              name_ENDS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT_CONTAINS?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT_STARTS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT_ENDS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              OR?: InputMaybe<Array<UserWhere>>;
              AND?: InputMaybe<Array<UserWhere>>;
              NOT?: InputMaybe<UserWhere>;
            };

            export type ResolverTypeWrapper<T> = Promise<T> | T;

            export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
              resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
            };
            export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
              | ResolverFn<TResult, TParent, TContext, TArgs>
              | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

            export type ResolverFn<TResult, TParent, TContext, TArgs> = (
              parent: TParent,
              args: TArgs,
              context: TContext,
              info: GraphQLResolveInfo
            ) => Promise<TResult> | TResult;

            export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
              parent: TParent,
              args: TArgs,
              context: TContext,
              info: GraphQLResolveInfo
            ) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

            export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
              parent: TParent,
              args: TArgs,
              context: TContext,
              info: GraphQLResolveInfo
            ) => TResult | Promise<TResult>;

            export interface SubscriptionSubscriberObject<
              TResult,
              TKey extends string,
              TParent,
              TContext,
              TArgs
            > {
              subscribe: SubscriptionSubscribeFn<
                { [key in TKey]: TResult },
                TParent,
                TContext,
                TArgs
              >;
              resolve?: SubscriptionResolveFn<
                TResult,
                { [key in TKey]: TResult },
                TContext,
                TArgs
              >;
            }

            export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
              subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
              resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
            }

            export type SubscriptionObject<
              TResult,
              TKey extends string,
              TParent,
              TContext,
              TArgs
            > =
              | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
              | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

            export type SubscriptionResolver<
              TResult,
              TKey extends string,
              TParent = {},
              TContext = {},
              TArgs = {}
            > =
              | ((
                  ...args: any[]
                ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
              | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

            export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
              parent: TParent,
              context: TContext,
              info: GraphQLResolveInfo
            ) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

            export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
              obj: T,
              context: TContext,
              info: GraphQLResolveInfo
            ) => boolean | Promise<boolean>;

            export type NextResolverFn<T> = () => Promise<T>;

            export type DirectiveResolverFn<
              TResult = {},
              TParent = {},
              TContext = {},
              TArgs = {}
            > = (
              next: NextResolverFn<TResult>,
              parent: TParent,
              args: TArgs,
              context: TContext,
              info: GraphQLResolveInfo
            ) => TResult | Promise<TResult>;

            /** Mapping between all available schema types and the resolvers types */
            export type ResolversTypes = {
              Query: ResolverTypeWrapper<{}>;
              String: ResolverTypeWrapper<Scalars[\\"String\\"][\\"output\\"]>;
              Int: ResolverTypeWrapper<Scalars[\\"Int\\"][\\"output\\"]>;
              Mutation: ResolverTypeWrapper<{}>;
              SortDirection: SortDirection;
              CreateInfo: ResolverTypeWrapper<CreateInfo>;
              CreateUsersMutationResponse: ResolverTypeWrapper<CreateUsersMutationResponse>;
              DeleteInfo: ResolverTypeWrapper<DeleteInfo>;
              PageInfo: ResolverTypeWrapper<PageInfo>;
              Boolean: ResolverTypeWrapper<Scalars[\\"Boolean\\"][\\"output\\"]>;
              StringAggregateSelection: ResolverTypeWrapper<StringAggregateSelection>;
              UpdateInfo: ResolverTypeWrapper<UpdateInfo>;
              UpdateUsersMutationResponse: ResolverTypeWrapper<UpdateUsersMutationResponse>;
              User: ResolverTypeWrapper<User>;
              UserAggregateSelection: ResolverTypeWrapper<UserAggregateSelection>;
              UserEdge: ResolverTypeWrapper<UserEdge>;
              UserFulltextResult: ResolverTypeWrapper<UserFulltextResult>;
              Float: ResolverTypeWrapper<Scalars[\\"Float\\"][\\"output\\"]>;
              UsersConnection: ResolverTypeWrapper<UsersConnection>;
              FloatWhere: FloatWhere;
              UserCreateInput: UserCreateInput;
              UserFulltext: UserFulltext;
              UserFulltextSort: UserFulltextSort;
              UserFulltextWhere: UserFulltextWhere;
              UserOptions: UserOptions;
              UserSort: UserSort;
              UserUpdateInput: UserUpdateInput;
              UserUserNameFulltext: UserUserNameFulltext;
              UserWhere: UserWhere;
            };

            /** Mapping between all available schema types and the resolvers parents */
            export type ResolversParentTypes = {
              Query: {};
              String: Scalars[\\"String\\"][\\"output\\"];
              Int: Scalars[\\"Int\\"][\\"output\\"];
              Mutation: {};
              CreateInfo: CreateInfo;
              CreateUsersMutationResponse: CreateUsersMutationResponse;
              DeleteInfo: DeleteInfo;
              PageInfo: PageInfo;
              Boolean: Scalars[\\"Boolean\\"][\\"output\\"];
              StringAggregateSelection: StringAggregateSelection;
              UpdateInfo: UpdateInfo;
              UpdateUsersMutationResponse: UpdateUsersMutationResponse;
              User: User;
              UserAggregateSelection: UserAggregateSelection;
              UserEdge: UserEdge;
              UserFulltextResult: UserFulltextResult;
              Float: Scalars[\\"Float\\"][\\"output\\"];
              UsersConnection: UsersConnection;
              FloatWhere: FloatWhere;
              UserCreateInput: UserCreateInput;
              UserFulltext: UserFulltext;
              UserFulltextSort: UserFulltextSort;
              UserFulltextWhere: UserFulltextWhere;
              UserOptions: UserOptions;
              UserSort: UserSort;
              UserUpdateInput: UserUpdateInput;
              UserUserNameFulltext: UserUserNameFulltext;
              UserWhere: UserWhere;
            };

            export type QueryResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"Query\\"] = ResolversParentTypes[\\"Query\\"]
            > = {
              usersFulltextUserName?: Resolver<
                Array<ResolversTypes[\\"UserFulltextResult\\"]>,
                ParentType,
                ContextType,
                RequireFields<QueryUsersFulltextUserNameArgs, \\"phrase\\">
              >;
              users?: Resolver<
                Array<ResolversTypes[\\"User\\"]>,
                ParentType,
                ContextType,
                Partial<QueryUsersArgs>
              >;
              usersConnection?: Resolver<
                ResolversTypes[\\"UsersConnection\\"],
                ParentType,
                ContextType,
                Partial<QueryUsersConnectionArgs>
              >;
              usersAggregate?: Resolver<
                ResolversTypes[\\"UserAggregateSelection\\"],
                ParentType,
                ContextType,
                Partial<QueryUsersAggregateArgs>
              >;
            };

            export type MutationResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"Mutation\\"] = ResolversParentTypes[\\"Mutation\\"]
            > = {
              createUsers?: Resolver<
                ResolversTypes[\\"CreateUsersMutationResponse\\"],
                ParentType,
                ContextType,
                RequireFields<MutationCreateUsersArgs, \\"input\\">
              >;
              deleteUsers?: Resolver<
                ResolversTypes[\\"DeleteInfo\\"],
                ParentType,
                ContextType,
                Partial<MutationDeleteUsersArgs>
              >;
              updateUsers?: Resolver<
                ResolversTypes[\\"UpdateUsersMutationResponse\\"],
                ParentType,
                ContextType,
                Partial<MutationUpdateUsersArgs>
              >;
            };

            export type CreateInfoResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"CreateInfo\\"] = ResolversParentTypes[\\"CreateInfo\\"]
            > = {
              bookmark?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              nodesCreated?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              relationshipsCreated?: Resolver<
                ResolversTypes[\\"Int\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type CreateUsersMutationResponseResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"CreateUsersMutationResponse\\"] = ResolversParentTypes[\\"CreateUsersMutationResponse\\"]
            > = {
              info?: Resolver<ResolversTypes[\\"CreateInfo\\"], ParentType, ContextType>;
              users?: Resolver<Array<ResolversTypes[\\"User\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type DeleteInfoResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"DeleteInfo\\"] = ResolversParentTypes[\\"DeleteInfo\\"]
            > = {
              bookmark?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              nodesDeleted?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              relationshipsDeleted?: Resolver<
                ResolversTypes[\\"Int\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type PageInfoResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"PageInfo\\"] = ResolversParentTypes[\\"PageInfo\\"]
            > = {
              hasNextPage?: Resolver<ResolversTypes[\\"Boolean\\"], ParentType, ContextType>;
              hasPreviousPage?: Resolver<
                ResolversTypes[\\"Boolean\\"],
                ParentType,
                ContextType
              >;
              startCursor?: Resolver<
                Maybe<ResolversTypes[\\"String\\"]>,
                ParentType,
                ContextType
              >;
              endCursor?: Resolver<
                Maybe<ResolversTypes[\\"String\\"]>,
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type StringAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"StringAggregateSelection\\"] = ResolversParentTypes[\\"StringAggregateSelection\\"]
            > = {
              shortest?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              longest?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UpdateInfoResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UpdateInfo\\"] = ResolversParentTypes[\\"UpdateInfo\\"]
            > = {
              bookmark?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              nodesCreated?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              nodesDeleted?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              relationshipsCreated?: Resolver<
                ResolversTypes[\\"Int\\"],
                ParentType,
                ContextType
              >;
              relationshipsDeleted?: Resolver<
                ResolversTypes[\\"Int\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UpdateUsersMutationResponseResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UpdateUsersMutationResponse\\"] = ResolversParentTypes[\\"UpdateUsersMutationResponse\\"]
            > = {
              info?: Resolver<ResolversTypes[\\"UpdateInfo\\"], ParentType, ContextType>;
              users?: Resolver<Array<ResolversTypes[\\"User\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UserResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"User\\"] = ResolversParentTypes[\\"User\\"]
            > = {
              name?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UserAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UserAggregateSelection\\"] = ResolversParentTypes[\\"UserAggregateSelection\\"]
            > = {
              count?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              name?: Resolver<
                ResolversTypes[\\"StringAggregateSelection\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UserEdgeResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UserEdge\\"] = ResolversParentTypes[\\"UserEdge\\"]
            > = {
              cursor?: Resolver<ResolversTypes[\\"String\\"], ParentType, ContextType>;
              node?: Resolver<ResolversTypes[\\"User\\"], ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UserFulltextResultResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UserFulltextResult\\"] = ResolversParentTypes[\\"UserFulltextResult\\"]
            > = {
              score?: Resolver<ResolversTypes[\\"Float\\"], ParentType, ContextType>;
              user?: Resolver<ResolversTypes[\\"User\\"], ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UsersConnectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UsersConnection\\"] = ResolversParentTypes[\\"UsersConnection\\"]
            > = {
              totalCount?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              pageInfo?: Resolver<ResolversTypes[\\"PageInfo\\"], ParentType, ContextType>;
              edges?: Resolver<Array<ResolversTypes[\\"UserEdge\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type Resolvers<ContextType = any> = {
              Query?: QueryResolvers<ContextType>;
              Mutation?: MutationResolvers<ContextType>;
              CreateInfo?: CreateInfoResolvers<ContextType>;
              CreateUsersMutationResponse?: CreateUsersMutationResponseResolvers<ContextType>;
              DeleteInfo?: DeleteInfoResolvers<ContextType>;
              PageInfo?: PageInfoResolvers<ContextType>;
              StringAggregateSelection?: StringAggregateSelectionResolvers<ContextType>;
              UpdateInfo?: UpdateInfoResolvers<ContextType>;
              UpdateUsersMutationResponse?: UpdateUsersMutationResponseResolvers<ContextType>;
              User?: UserResolvers<ContextType>;
              UserAggregateSelection?: UserAggregateSelectionResolvers<ContextType>;
              UserEdge?: UserEdgeResolvers<ContextType>;
              UserFulltextResult?: UserFulltextResultResolvers<ContextType>;
              UsersConnection?: UsersConnectionResolvers<ContextType>;
            };

            export interface UserAggregateSelectionInput {
              count?: boolean;
              name?: boolean;
            }

            export type UserSelectionSet = SelectionSetObject<User, UserResolvers>;
            export type InferFromUserSelectionSet<TSelectionSet extends UserSelectionSet> =
              InferFromSelectionSetObject<User, UserResolvers, TSelectionSet>;

            export declare class UserModel {
              public find(args?: {
                where?: UserWhere;
                fulltext?: UserFulltext;
                options?: UserOptions;
                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<User[]>;
              public findSafe<TSelectionSet extends UserSelectionSet>(args?: {
                where?: UserWhere;
                fulltext?: UserFulltext;
                options?: UserOptions;
                selectionSet?: TSelectionSet;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<Prettify<InferFromUserSelectionSet<TSelectionSet>>[]>;
              public create(args: {
                input: UserCreateInput[];
                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<CreateUsersMutationResponse>;
              public update(args: {
                where?: UserWhere;
                update?: UserUpdateInput;

                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<UpdateUsersMutationResponse>;
              public delete(args: {
                where?: UserWhere;

                context?: any;
                rootValue?: any;
              }): Promise<{ nodesDeleted: number; relationshipsDeleted: number }>;
              public aggregate(args: {
                where?: UserWhere;
                fulltext?: UserFulltext;
                aggregate: UserAggregateSelectionInput;
                context?: any;
                rootValue?: any;
              }): Promise<UserAggregateSelection>;
            }

            export interface ModelMap {
              User: UserModel;
            }
            "
        `);
    });

    test("should generate simple types of a single node and write to a file", async () => {
        const fileName = `${randomstring({
            readable: true,
            charset: "alphabetic",
        })}.test-file.ts`;

        const outFile = path.join(__dirname, fileName);

        filesToDelete.push(outFile);

        const typeDefs = `
            type User {
                name: String
            }
        `;

        const ogm = new OGM({
            typeDefs,
            // @ts-ignore
            driver: {},
        });

        await generate({
            ogm,
            outFile,
        });

        const fileContent = await fs.promises.readFile(outFile, "utf-8");

        expect(fileContent).toMatchInlineSnapshot(`
            "import type { SelectionSetNode, DocumentNode } from \\"graphql\\";
            import type { RawGQL } from \\"@efebia/neo4j-graphql-ogm\\";
            export type RequiredResolvers = Required<Resolvers>;
            export type Primitive = string | number | boolean;
            export type Prettify<T> = {
              [K in keyof T]: T[K];
            } & {};
            export type AddRawGQL<T> = NonNullable<T> extends (infer TItem)[]
              ? (TItem | RawGQL)[]
              : NonNullable<T> extends Primitive
              ? T
              : IsAny<NonNullable<T>> extends true
              ? T
              : {
                  [key in keyof T]: AddRawGQL<T[key]> | RawGQL;
                };

            export type AddRawGQLToOptions<TProps> = TProps extends { where?: infer TWhere }
              ? {
                  where?: AddRawGQL<NonNullable<TWhere>>;
                } & AddRawGQLToOptions<Omit<TProps, \\"where\\">>
              : TProps extends { sort?: infer TSort }
              ? {
                  sort?: NonNullable<TSort> extends (infer TItem)[]
                    ? AddRawGQL<NonNullable<TItem>>[]
                    : never;
                }
              : {};

            export type ResolverArgs<
              TModel extends object,
              TKey extends keyof TModel,
              TResolvers extends { [key: PropertyKey]: Resolver<any, any, any, any> }
            > = TModel[TKey] extends Primitive
              ? never
              : NonNullable<TResolvers[TKey]> extends Resolver<any, any, any, infer Props>
              ? \\"directed\\" extends keyof Props
                ? Omit<Props, \\"directed\\" | \\"where\\" | \\"sort\\"> & {
                    directed?: boolean;
                  } & AddRawGQLToOptions<Props>
                : {}
              : {};

            export type UnionToIntersection<U> = (
              U extends any ? (k: U) => void : never
            ) extends (k: infer I) => void
              ? I
              : never;
            type LastOf<T> = UnionToIntersection<
              T extends any ? () => T : never
            > extends () => infer R
              ? R
              : never;

            type Push<T extends any[], V> = [...T, V];

            export type TuplifyUnion<
              T,
              L = LastOf<T>,
              N = [T] extends [never] ? true : false
            > = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>;

            // This is pure magic
            export type MagicArray<TArray extends any[]> =
              NonNullable<TArray> extends (infer TItem)[] ? TItem[] : never;
            export type MagicObject<TElement> =
              NonNullable<TElement> extends (infer TItem)[]
                ? TItem[]
                : NonNullable<TElement> extends Primitive
                ? TElement
                : {
                    [key in keyof TElement as TElement[key] extends never
                      ? never
                      : key]: MagicObject<TElement[key]>;
                  };

            export type StripNeverKeys<TElement> = TElement extends object
              ? {
                  [key in keyof TElement as [TElement[key]] extends [never]
                    ? never
                    : TElement[key] extends never[]
                    ? never
                    : key]: TElement[key];
                }
              : TElement;

            export type ClearObjectWithNeverKeys<
              TElement,
              TStripped = StripNeverKeys<TElement>
            > = [keyof Omit<TElement, keyof TStripped>] extends [never] ? TStripped : never;

            export type StripNeverKeysAddTypename<
              TElement,
              TKey,
              TStripped = ClearObjectWithNeverKeys<TElement>
            > = [keyof TStripped] extends [never]
              ? never
              : TStripped & { __typename: TKey };

            type RetrieveType<TItem> = Exclude<
              TItem,
              Promise<any>
            > extends ResolverTypeWrapper<infer TValue>
              ? TValue extends { __typename?: infer TName }
                ? TItem extends object
                  ? TName extends keyof Resolvers
                    ? \\"__isTypeOf\\" extends keyof RequiredResolvers[TName]
                      ? Omit<RequiredResolvers[TName], \\"__isTypeOf\\"> extends {
                          [key: string]: Resolver<any, any, any, any>;
                        }
                        ? {
                            Model: Exclude<TItem, Promise<any>>;
                            Resolvers: Omit<RequiredResolvers[TName], \\"__isTypeOf\\">;
                          }
                        : never
                      : never
                    : never
                  : never
                : never
              : never;

            export type ResolverReturnType<
              TModel extends object,
              TKey extends keyof TModel,
              TResolvers extends { [key: PropertyKey]: Resolver<any, any, any, any> }
            > = TModel[TKey] extends Primitive
              ? never
              : NonNullable<TResolvers[TKey]> extends Resolver<infer Props, any, any, any>
              ? Props extends (infer TItem)[]
                ? RetrieveType<Exclude<TItem, Promise<any>>>
                : RetrieveType<Exclude<Props, Promise<any>>>
              : never;

            export type ResolverObject = {
              [key: PropertyKey]: Resolver<any, any, any> | Resolver<any, any, any, any>;
            };

            export type ResolveKey<
              TModel extends object,
              TResolvers extends ResolverObject,
              TItem,
              TKey,
              TOmittedElement = TKey extends keyof TItem
                ? Omit<
                    NonNullable<TItem[TKey]>,
                    \\"where\\" | \\"directed\\" | \\"options\\" | \\"after\\" | \\"first\\" | \\"sort\\"
                  >
                : never
            > = TKey extends keyof TModel
              ? NonNullable<TModel[TKey]> extends Primitive
                ? TModel[TKey]
                : ResolverReturnType<TModel, TKey, TResolvers> extends {
                    Model: infer NestedTModel;
                    Resolvers: infer NestedResolvers;
                  }
                ? NestedTModel extends object
                  ? NestedResolvers extends ResolverObject
                    ? TKey extends keyof TItem
                      ? \\"on\\" extends keyof TOmittedElement
                        ?
                            | ({
                                -readonly [key in keyof TOmittedElement[\\"on\\"]]: StripNeverKeysAddTypename<
                                  {
                                    -readonly [K in keyof TOmittedElement[\\"on\\"][key]]: K extends keyof NestedTModel
                                      ? NestedTModel[K] extends any[]
                                        ? MagicArray<
                                            ResolveKey<
                                              NestedTModel,
                                              NestedResolvers,
                                              TOmittedElement[\\"on\\"][key],
                                              K
                                            >[]
                                          >
                                        : ResolveKey<
                                            NestedTModel,
                                            NestedResolvers,
                                            TOmittedElement[\\"on\\"][key],
                                            K
                                          >
                                      : never;
                                  },
                                  key
                                >;
                              }[keyof TOmittedElement[\\"on\\"]] &
                                ResolveKey<
                                  TModel,
                                  TResolvers,
                                  Omit<TItem, TKey> & {
                                    [key in TKey]: Omit<TOmittedElement, \\"on\\">;
                                  },
                                  TKey
                                >)
                            | (undefined extends TModel[TKey]
                                ? NonNullable<TModel[TKey]> extends any[]
                                  ? never
                                  : undefined
                                : never)
                            | (undefined extends TItem[TKey]
                                ? NonNullable<TModel[TKey]> extends any[]
                                  ? never
                                  : undefined
                                : never)
                        : ClearObjectWithNeverKeys<
                            | {
                                -readonly [key in keyof TOmittedElement as key extends keyof NestedTModel
                                  ? key
                                  : never]: key extends keyof NestedTModel
                                  ? NestedTModel[key] extends any[]
                                    ? MagicArray<
                                        ResolveKey<
                                          NestedTModel,
                                          NestedResolvers,
                                          TOmittedElement,
                                          key
                                        >[]
                                      >
                                    : ResolveKey<
                                        NestedTModel,
                                        NestedResolvers,
                                        TOmittedElement,
                                        key
                                      >
                                  : never;
                              }
                            | (undefined extends TModel[TKey]
                                ? NonNullable<TModel[TKey]> extends any[]
                                  ? never
                                  : undefined
                                : never)
                            | (undefined extends TItem[TKey]
                                ? NonNullable<TModel[TKey]> extends any[]
                                  ? never
                                  : undefined
                                : never)
                          >
                      : never
                    : never
                  : TModel[TKey] extends (infer TArrayItem)[]
                  ? NonNullable<TArrayItem> extends Primitive
                    ? TArrayItem
                    : never
                  : never
                : never
              : never;

            //Only if TValue = any, this is true
            export type IsAny<TValue> = unknown extends TValue ? true : false;

            export type NestedBooleanObject<
              TModel extends object,
              TResolvers extends ResolverObject,
              TKey extends keyof TModel,
              TElement,
              RequiredValue extends NonNullable<TElement> = NonNullable<TElement>
            > = IsAny<RequiredValue> extends true
              ? boolean
              : RequiredValue extends object
              ? RequiredValue extends (infer TItem)[]
                ? NonNullable<TItem> extends Primitive
                  ? boolean
                  : {
                      [key in keyof TItem]?: ResolverReturnType<
                        TModel,
                        TKey,
                        TResolvers
                      > extends {
                        Model: infer NestedModel;
                        Resolvers: infer NestedResolvers;
                      }
                        ? NestedModel extends object
                          ? NestedResolvers extends ResolverObject
                            ? key extends keyof NestedModel
                              ? NonNullable<TItem[key]> extends object
                                ? NonNullable<TItem[key]> extends any[]
                                  ? NestedBooleanObject<
                                      NestedModel,
                                      NestedResolvers,
                                      key,
                                      NonNullable<NonNullable<TItem>[key]>
                                    >
                                  : IsAny<NonNullable<TItem[key]>> extends true
                                  ? boolean
                                  : \\"__typename\\" extends keyof NonNullable<TItem[key]>
                                  ? NestedBooleanObject<
                                      NestedModel,
                                      NestedResolvers,
                                      key,
                                      UnionToIntersection<
                                        Omit<
                                          NonNullable<NonNullable<TItem>[key]>,
                                          \\"__typename\\"
                                        >
                                      > & {
                                        __typename: NonNullable<
                                          NonNullable<TItem[key]>[\\"__typename\\"]
                                        >;
                                      }
                                    >
                                  : never
                                : boolean
                              : never
                            : never
                          : never
                        : never;
                    } & ResolverArgs<TModel, TKey, TResolvers> &
                      BooleanOn<TElement>
                : {
                    [key in keyof RequiredValue]?: ResolverReturnType<
                      TModel,
                      TKey,
                      TResolvers
                    > extends { Model: infer NestedModel; Resolvers: infer NestedResolvers }
                      ? NestedModel extends object
                        ? NestedResolvers extends ResolverObject
                          ? key extends keyof NestedModel
                            ? NonNullable<RequiredValue[key]> extends any[]
                              ? NestedBooleanObject<
                                  NestedModel,
                                  NestedResolvers,
                                  key,
                                  NonNullable<RequiredValue[key]>
                                >
                              : NonNullable<RequiredValue[key]> extends object
                              ? IsAny<NonNullable<RequiredValue[key]>> extends true
                                ? boolean
                                : \\"__typename\\" extends keyof NonNullable<RequiredValue[key]>
                                ? NestedBooleanObject<
                                    NestedModel,
                                    NestedResolvers,
                                    key,
                                    UnionToIntersection<
                                      Omit<NonNullable<RequiredValue[key]>, \\"__typename\\">
                                    > & {
                                      __typename: NonNullable<
                                        NonNullable<RequiredValue[key]>[\\"__typename\\"]
                                      >;
                                    }
                                  >
                                : never
                              : boolean
                            : never
                          : never
                        : never
                      : never;
                  } & BooleanOn<TElement> &
                    ResolverArgs<TModel, TKey, TResolvers>
              : boolean;

            export type SelectionSetObject<
              TModel extends object,
              TResolvers extends ResolverObject
            > = {
              [key in keyof TModel]?: NonNullable<TModel[key]> extends Primitive
                ? boolean
                : NonNullable<TModel[key]> extends (infer TItem)[]
                ? \\"__typename\\" extends keyof TItem
                  ? NestedBooleanObject<
                      TModel,
                      TResolvers,
                      key,
                      Prettify<
                        UnionToIntersection<Omit<NonNullable<TItem>, \\"__typename\\">> & {
                          __typename: NonNullable<NonNullable<TItem>[\\"__typename\\"]>;
                        }
                      >
                    >
                  : NonNullable<TItem> extends Primitive
                  ? boolean
                  : never
                : \\"__typename\\" extends keyof NonNullable<TModel[key]>
                ? NestedBooleanObject<
                    TModel,
                    TResolvers,
                    key,
                    Prettify<
                      UnionToIntersection<Omit<NonNullable<TModel[key]>, \\"__typename\\">> & {
                        __typename: NonNullable<NonNullable<TModel[key]>[\\"__typename\\"]>;
                      }
                    >
                  >
                : never;
            };

            type BooleanOn<TElement> = TElement extends { __typename: infer Typename }
              ? TuplifyUnion<NonNullable<Typename>>[\\"length\\"] extends 1
                ? {}
                : NonNullable<Typename> extends string
                ? {
                    on?: {
                      [key in NonNullable<Typename>]?: key extends keyof RequiredResolvers
                        ? key extends keyof ResolversTypes
                          ? Omit<
                              RequiredResolvers[key],
                              \\"__isTypeOf\\"
                            > extends ResolverObject
                            ? {
                                [K in keyof NonNullable<
                                  Exclude<ResolversTypes[key], Promise<any>>
                                >]?: NestedBooleanObject<
                                  NonNullable<Exclude<ResolversTypes[key], Promise<any>>>,
                                  Omit<RequiredResolvers[key], \\"__isTypeOf\\">,
                                  K,
                                  NonNullable<Exclude<ResolversTypes[key], Promise<any>>>[K]
                                >;
                              }
                            : never
                          : never
                        : never;
                    };
                  }
                : never
              : {};

            export type InferFromSelectionSetObject<
              TModel extends object,
              TResolvers extends ResolverObject,
              TSelectionSet extends SelectionSetObject<TModel, TResolvers>
            > = MagicObject<{
              -readonly [key in keyof TSelectionSet]: key extends keyof TModel
                ? NonNullable<TModel[key]> extends any[]
                  ?
                      | ResolveKey<TModel, TResolvers, TSelectionSet, key>[]
                      | (undefined extends TModel[key] ? undefined : never)
                  :
                      | ResolveKey<TModel, TResolvers, TSelectionSet, key>
                      | (undefined extends TModel[key] ? undefined : never)
                : never;
            }>;
            import { GraphQLResolveInfo } from \\"graphql\\";
            export type Maybe<T> = T | null;
            export type InputMaybe<T> = Maybe<T>;
            export type Exact<T extends { [key: string]: unknown }> = {
              [K in keyof T]: T[K];
            };
            export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
              [SubKey in K]?: Maybe<T[SubKey]>;
            };
            export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
              [SubKey in K]: Maybe<T[SubKey]>;
            };
            export type MakeEmpty<
              T extends { [key: string]: unknown },
              K extends keyof T
            > = { [_ in K]?: never };
            export type Incremental<T> =
              | T
              | {
                  [P in keyof T]?: P extends \\" $fragmentName\\" | \\"__typename\\" ? T[P] : never;
                };
            export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
              [P in K]-?: NonNullable<T[P]>;
            };
            /** All built-in and custom scalars, mapped to their actual values */
            export type Scalars = {
              ID: { input: string; output: string };
              /** The \`String\` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text. */
              String: { input: string; output: string };
              /** The \`Boolean\` scalar type represents \`true\` or \`false\`. */
              Boolean: { input: boolean; output: boolean };
              /** The \`Int\` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. */
              Int: { input: number; output: number };
              Float: { input: number; output: number };
            };

            export type Query = {
              __typename?: \\"Query\\";
              users: Array<User>;
              usersConnection: UsersConnection;
              usersAggregate: UserAggregateSelection;
            };

            export type QueryUsersArgs = {
              where?: InputMaybe<UserWhere>;
              options?: InputMaybe<UserOptions>;
            };

            export type QueryUsersConnectionArgs = {
              first?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              after?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              where?: InputMaybe<UserWhere>;
              sort?: InputMaybe<Array<InputMaybe<UserSort>>>;
            };

            export type QueryUsersAggregateArgs = {
              where?: InputMaybe<UserWhere>;
            };

            export type Mutation = {
              __typename?: \\"Mutation\\";
              createUsers: CreateUsersMutationResponse;
              deleteUsers: DeleteInfo;
              updateUsers: UpdateUsersMutationResponse;
            };

            export type MutationCreateUsersArgs = {
              input: Array<UserCreateInput>;
            };

            export type MutationDeleteUsersArgs = {
              where?: InputMaybe<UserWhere>;
            };

            export type MutationUpdateUsersArgs = {
              where?: InputMaybe<UserWhere>;
              update?: InputMaybe<UserUpdateInput>;
            };

            /** An enum for sorting in either ascending or descending order. */
            export enum SortDirection {
              /** Sort by field values in ascending order. */
              Asc = \\"ASC\\",
              /** Sort by field values in descending order. */
              Desc = \\"DESC\\",
            }

            /** Information about the number of nodes and relationships created during a create mutation */
            export type CreateInfo = {
              __typename?: \\"CreateInfo\\";
              /** @deprecated This field has been deprecated because bookmarks are now handled by the driver. */
              bookmark?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              nodesCreated: Scalars[\\"Int\\"][\\"output\\"];
              relationshipsCreated: Scalars[\\"Int\\"][\\"output\\"];
            };

            export type CreateUsersMutationResponse = {
              __typename?: \\"CreateUsersMutationResponse\\";
              info: CreateInfo;
              users: Array<User>;
            };

            /** Information about the number of nodes and relationships deleted during a delete mutation */
            export type DeleteInfo = {
              __typename?: \\"DeleteInfo\\";
              /** @deprecated This field has been deprecated because bookmarks are now handled by the driver. */
              bookmark?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              nodesDeleted: Scalars[\\"Int\\"][\\"output\\"];
              relationshipsDeleted: Scalars[\\"Int\\"][\\"output\\"];
            };

            /** Pagination information (Relay) */
            export type PageInfo = {
              __typename?: \\"PageInfo\\";
              hasNextPage: Scalars[\\"Boolean\\"][\\"output\\"];
              hasPreviousPage: Scalars[\\"Boolean\\"][\\"output\\"];
              startCursor?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              endCursor?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
            };

            export type StringAggregateSelection = {
              __typename?: \\"StringAggregateSelection\\";
              shortest?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              longest?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
            };

            /** Information about the number of nodes and relationships created and deleted during an update mutation */
            export type UpdateInfo = {
              __typename?: \\"UpdateInfo\\";
              /** @deprecated This field has been deprecated because bookmarks are now handled by the driver. */
              bookmark?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              nodesCreated: Scalars[\\"Int\\"][\\"output\\"];
              nodesDeleted: Scalars[\\"Int\\"][\\"output\\"];
              relationshipsCreated: Scalars[\\"Int\\"][\\"output\\"];
              relationshipsDeleted: Scalars[\\"Int\\"][\\"output\\"];
            };

            export type UpdateUsersMutationResponse = {
              __typename?: \\"UpdateUsersMutationResponse\\";
              info: UpdateInfo;
              users: Array<User>;
            };

            export type User = {
              __typename?: \\"User\\";
              name?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
            };

            export type UserAggregateSelection = {
              __typename?: \\"UserAggregateSelection\\";
              count: Scalars[\\"Int\\"][\\"output\\"];
              name: StringAggregateSelection;
            };

            export type UserEdge = {
              __typename?: \\"UserEdge\\";
              cursor: Scalars[\\"String\\"][\\"output\\"];
              node: User;
            };

            export type UsersConnection = {
              __typename?: \\"UsersConnection\\";
              totalCount: Scalars[\\"Int\\"][\\"output\\"];
              pageInfo: PageInfo;
              edges: Array<UserEdge>;
            };

            export type UserCreateInput = {
              name?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
            };

            export type UserOptions = {
              limit?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              offset?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** Specify one or more UserSort objects to sort Users by. The sorts will be applied in the order in which they are arranged in the array. */
              sort?: InputMaybe<Array<UserSort>>;
            };

            /** Fields to sort Users by. The order in which sorts are applied is not guaranteed when specifying many fields in one UserSort object. */
            export type UserSort = {
              name?: InputMaybe<SortDirection>;
            };

            export type UserUpdateInput = {
              name?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
            };

            export type UserWhere = {
              name?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              name_IN?: InputMaybe<Array<InputMaybe<Scalars[\\"String\\"][\\"input\\"]>>>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT_IN?: InputMaybe<Array<InputMaybe<Scalars[\\"String\\"][\\"input\\"]>>>;
              name_CONTAINS?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              name_STARTS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              name_ENDS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT_CONTAINS?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT_STARTS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT_ENDS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              OR?: InputMaybe<Array<UserWhere>>;
              AND?: InputMaybe<Array<UserWhere>>;
              NOT?: InputMaybe<UserWhere>;
            };

            export type ResolverTypeWrapper<T> = Promise<T> | T;

            export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
              resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
            };
            export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
              | ResolverFn<TResult, TParent, TContext, TArgs>
              | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

            export type ResolverFn<TResult, TParent, TContext, TArgs> = (
              parent: TParent,
              args: TArgs,
              context: TContext,
              info: GraphQLResolveInfo
            ) => Promise<TResult> | TResult;

            export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
              parent: TParent,
              args: TArgs,
              context: TContext,
              info: GraphQLResolveInfo
            ) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

            export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
              parent: TParent,
              args: TArgs,
              context: TContext,
              info: GraphQLResolveInfo
            ) => TResult | Promise<TResult>;

            export interface SubscriptionSubscriberObject<
              TResult,
              TKey extends string,
              TParent,
              TContext,
              TArgs
            > {
              subscribe: SubscriptionSubscribeFn<
                { [key in TKey]: TResult },
                TParent,
                TContext,
                TArgs
              >;
              resolve?: SubscriptionResolveFn<
                TResult,
                { [key in TKey]: TResult },
                TContext,
                TArgs
              >;
            }

            export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
              subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
              resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
            }

            export type SubscriptionObject<
              TResult,
              TKey extends string,
              TParent,
              TContext,
              TArgs
            > =
              | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
              | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

            export type SubscriptionResolver<
              TResult,
              TKey extends string,
              TParent = {},
              TContext = {},
              TArgs = {}
            > =
              | ((
                  ...args: any[]
                ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
              | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

            export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
              parent: TParent,
              context: TContext,
              info: GraphQLResolveInfo
            ) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

            export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
              obj: T,
              context: TContext,
              info: GraphQLResolveInfo
            ) => boolean | Promise<boolean>;

            export type NextResolverFn<T> = () => Promise<T>;

            export type DirectiveResolverFn<
              TResult = {},
              TParent = {},
              TContext = {},
              TArgs = {}
            > = (
              next: NextResolverFn<TResult>,
              parent: TParent,
              args: TArgs,
              context: TContext,
              info: GraphQLResolveInfo
            ) => TResult | Promise<TResult>;

            /** Mapping between all available schema types and the resolvers types */
            export type ResolversTypes = {
              Query: ResolverTypeWrapper<{}>;
              Int: ResolverTypeWrapper<Scalars[\\"Int\\"][\\"output\\"]>;
              String: ResolverTypeWrapper<Scalars[\\"String\\"][\\"output\\"]>;
              Mutation: ResolverTypeWrapper<{}>;
              SortDirection: SortDirection;
              CreateInfo: ResolverTypeWrapper<CreateInfo>;
              CreateUsersMutationResponse: ResolverTypeWrapper<CreateUsersMutationResponse>;
              DeleteInfo: ResolverTypeWrapper<DeleteInfo>;
              PageInfo: ResolverTypeWrapper<PageInfo>;
              Boolean: ResolverTypeWrapper<Scalars[\\"Boolean\\"][\\"output\\"]>;
              StringAggregateSelection: ResolverTypeWrapper<StringAggregateSelection>;
              UpdateInfo: ResolverTypeWrapper<UpdateInfo>;
              UpdateUsersMutationResponse: ResolverTypeWrapper<UpdateUsersMutationResponse>;
              User: ResolverTypeWrapper<User>;
              UserAggregateSelection: ResolverTypeWrapper<UserAggregateSelection>;
              UserEdge: ResolverTypeWrapper<UserEdge>;
              UsersConnection: ResolverTypeWrapper<UsersConnection>;
              UserCreateInput: UserCreateInput;
              UserOptions: UserOptions;
              UserSort: UserSort;
              UserUpdateInput: UserUpdateInput;
              UserWhere: UserWhere;
            };

            /** Mapping between all available schema types and the resolvers parents */
            export type ResolversParentTypes = {
              Query: {};
              Int: Scalars[\\"Int\\"][\\"output\\"];
              String: Scalars[\\"String\\"][\\"output\\"];
              Mutation: {};
              CreateInfo: CreateInfo;
              CreateUsersMutationResponse: CreateUsersMutationResponse;
              DeleteInfo: DeleteInfo;
              PageInfo: PageInfo;
              Boolean: Scalars[\\"Boolean\\"][\\"output\\"];
              StringAggregateSelection: StringAggregateSelection;
              UpdateInfo: UpdateInfo;
              UpdateUsersMutationResponse: UpdateUsersMutationResponse;
              User: User;
              UserAggregateSelection: UserAggregateSelection;
              UserEdge: UserEdge;
              UsersConnection: UsersConnection;
              UserCreateInput: UserCreateInput;
              UserOptions: UserOptions;
              UserSort: UserSort;
              UserUpdateInput: UserUpdateInput;
              UserWhere: UserWhere;
            };

            export type QueryResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"Query\\"] = ResolversParentTypes[\\"Query\\"]
            > = {
              users?: Resolver<
                Array<ResolversTypes[\\"User\\"]>,
                ParentType,
                ContextType,
                Partial<QueryUsersArgs>
              >;
              usersConnection?: Resolver<
                ResolversTypes[\\"UsersConnection\\"],
                ParentType,
                ContextType,
                Partial<QueryUsersConnectionArgs>
              >;
              usersAggregate?: Resolver<
                ResolversTypes[\\"UserAggregateSelection\\"],
                ParentType,
                ContextType,
                Partial<QueryUsersAggregateArgs>
              >;
            };

            export type MutationResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"Mutation\\"] = ResolversParentTypes[\\"Mutation\\"]
            > = {
              createUsers?: Resolver<
                ResolversTypes[\\"CreateUsersMutationResponse\\"],
                ParentType,
                ContextType,
                RequireFields<MutationCreateUsersArgs, \\"input\\">
              >;
              deleteUsers?: Resolver<
                ResolversTypes[\\"DeleteInfo\\"],
                ParentType,
                ContextType,
                Partial<MutationDeleteUsersArgs>
              >;
              updateUsers?: Resolver<
                ResolversTypes[\\"UpdateUsersMutationResponse\\"],
                ParentType,
                ContextType,
                Partial<MutationUpdateUsersArgs>
              >;
            };

            export type CreateInfoResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"CreateInfo\\"] = ResolversParentTypes[\\"CreateInfo\\"]
            > = {
              bookmark?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              nodesCreated?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              relationshipsCreated?: Resolver<
                ResolversTypes[\\"Int\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type CreateUsersMutationResponseResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"CreateUsersMutationResponse\\"] = ResolversParentTypes[\\"CreateUsersMutationResponse\\"]
            > = {
              info?: Resolver<ResolversTypes[\\"CreateInfo\\"], ParentType, ContextType>;
              users?: Resolver<Array<ResolversTypes[\\"User\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type DeleteInfoResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"DeleteInfo\\"] = ResolversParentTypes[\\"DeleteInfo\\"]
            > = {
              bookmark?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              nodesDeleted?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              relationshipsDeleted?: Resolver<
                ResolversTypes[\\"Int\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type PageInfoResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"PageInfo\\"] = ResolversParentTypes[\\"PageInfo\\"]
            > = {
              hasNextPage?: Resolver<ResolversTypes[\\"Boolean\\"], ParentType, ContextType>;
              hasPreviousPage?: Resolver<
                ResolversTypes[\\"Boolean\\"],
                ParentType,
                ContextType
              >;
              startCursor?: Resolver<
                Maybe<ResolversTypes[\\"String\\"]>,
                ParentType,
                ContextType
              >;
              endCursor?: Resolver<
                Maybe<ResolversTypes[\\"String\\"]>,
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type StringAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"StringAggregateSelection\\"] = ResolversParentTypes[\\"StringAggregateSelection\\"]
            > = {
              shortest?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              longest?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UpdateInfoResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UpdateInfo\\"] = ResolversParentTypes[\\"UpdateInfo\\"]
            > = {
              bookmark?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              nodesCreated?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              nodesDeleted?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              relationshipsCreated?: Resolver<
                ResolversTypes[\\"Int\\"],
                ParentType,
                ContextType
              >;
              relationshipsDeleted?: Resolver<
                ResolversTypes[\\"Int\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UpdateUsersMutationResponseResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UpdateUsersMutationResponse\\"] = ResolversParentTypes[\\"UpdateUsersMutationResponse\\"]
            > = {
              info?: Resolver<ResolversTypes[\\"UpdateInfo\\"], ParentType, ContextType>;
              users?: Resolver<Array<ResolversTypes[\\"User\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UserResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"User\\"] = ResolversParentTypes[\\"User\\"]
            > = {
              name?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UserAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UserAggregateSelection\\"] = ResolversParentTypes[\\"UserAggregateSelection\\"]
            > = {
              count?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              name?: Resolver<
                ResolversTypes[\\"StringAggregateSelection\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UserEdgeResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UserEdge\\"] = ResolversParentTypes[\\"UserEdge\\"]
            > = {
              cursor?: Resolver<ResolversTypes[\\"String\\"], ParentType, ContextType>;
              node?: Resolver<ResolversTypes[\\"User\\"], ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UsersConnectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UsersConnection\\"] = ResolversParentTypes[\\"UsersConnection\\"]
            > = {
              totalCount?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              pageInfo?: Resolver<ResolversTypes[\\"PageInfo\\"], ParentType, ContextType>;
              edges?: Resolver<Array<ResolversTypes[\\"UserEdge\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type Resolvers<ContextType = any> = {
              Query?: QueryResolvers<ContextType>;
              Mutation?: MutationResolvers<ContextType>;
              CreateInfo?: CreateInfoResolvers<ContextType>;
              CreateUsersMutationResponse?: CreateUsersMutationResponseResolvers<ContextType>;
              DeleteInfo?: DeleteInfoResolvers<ContextType>;
              PageInfo?: PageInfoResolvers<ContextType>;
              StringAggregateSelection?: StringAggregateSelectionResolvers<ContextType>;
              UpdateInfo?: UpdateInfoResolvers<ContextType>;
              UpdateUsersMutationResponse?: UpdateUsersMutationResponseResolvers<ContextType>;
              User?: UserResolvers<ContextType>;
              UserAggregateSelection?: UserAggregateSelectionResolvers<ContextType>;
              UserEdge?: UserEdgeResolvers<ContextType>;
              UsersConnection?: UsersConnectionResolvers<ContextType>;
            };

            export interface UserAggregateSelectionInput {
              count?: boolean;
              name?: boolean;
            }

            export type UserSelectionSet = SelectionSetObject<User, UserResolvers>;
            export type InferFromUserSelectionSet<TSelectionSet extends UserSelectionSet> =
              InferFromSelectionSetObject<User, UserResolvers, TSelectionSet>;

            export declare class UserModel {
              public find(args?: {
                where?: UserWhere;

                options?: UserOptions;
                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<User[]>;
              public findSafe<TSelectionSet extends UserSelectionSet>(args?: {
                where?: UserWhere;

                options?: UserOptions;
                selectionSet?: TSelectionSet;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<Prettify<InferFromUserSelectionSet<TSelectionSet>>[]>;
              public create(args: {
                input: UserCreateInput[];
                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<CreateUsersMutationResponse>;
              public update(args: {
                where?: UserWhere;
                update?: UserUpdateInput;

                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<UpdateUsersMutationResponse>;
              public delete(args: {
                where?: UserWhere;

                context?: any;
                rootValue?: any;
              }): Promise<{ nodesDeleted: number; relationshipsDeleted: number }>;
              public aggregate(args: {
                where?: UserWhere;

                aggregate: UserAggregateSelectionInput;
                context?: any;
                rootValue?: any;
              }): Promise<UserAggregateSelection>;
            }

            export interface ModelMap {
              User: UserModel;
            }
            "
        `);
    });

    test("should generate more complex types of two nodes with a relationship and properties and return the string", async () => {
        const typeDefs = `
            type Movie {
                title: String!
                actors: [Person!]! @relationship(type: "ACTED_IN", direction: IN, properties: "ActedIn")
            }
            type Person {
                name: String!
            }
            type ActedIn @relationshipProperties {
                screenTime: Int!
            }
        `;

        const ogm = new OGM({
            typeDefs,
            // @ts-ignore
            driver: {},
        });

        const generated = (await generate({
            ogm,
            noWrite: true,
        })) as string;

        expect(generated).toMatchInlineSnapshot(`
            "import type { SelectionSetNode, DocumentNode } from \\"graphql\\";
            import type { RawGQL } from \\"@efebia/neo4j-graphql-ogm\\";
            export type RequiredResolvers = Required<Resolvers>;
            export type Primitive = string | number | boolean;
            export type Prettify<T> = {
              [K in keyof T]: T[K];
            } & {};
            export type AddRawGQL<T> = NonNullable<T> extends (infer TItem)[]
              ? (TItem | RawGQL)[]
              : NonNullable<T> extends Primitive
              ? T
              : IsAny<NonNullable<T>> extends true
              ? T
              : {
                  [key in keyof T]: AddRawGQL<T[key]> | RawGQL;
                };

            export type AddRawGQLToOptions<TProps> = TProps extends { where?: infer TWhere }
              ? {
                  where?: AddRawGQL<NonNullable<TWhere>>;
                } & AddRawGQLToOptions<Omit<TProps, \\"where\\">>
              : TProps extends { sort?: infer TSort }
              ? {
                  sort?: NonNullable<TSort> extends (infer TItem)[]
                    ? AddRawGQL<NonNullable<TItem>>[]
                    : never;
                }
              : {};

            export type ResolverArgs<
              TModel extends object,
              TKey extends keyof TModel,
              TResolvers extends { [key: PropertyKey]: Resolver<any, any, any, any> }
            > = TModel[TKey] extends Primitive
              ? never
              : NonNullable<TResolvers[TKey]> extends Resolver<any, any, any, infer Props>
              ? \\"directed\\" extends keyof Props
                ? Omit<Props, \\"directed\\" | \\"where\\" | \\"sort\\"> & {
                    directed?: boolean;
                  } & AddRawGQLToOptions<Props>
                : {}
              : {};

            export type UnionToIntersection<U> = (
              U extends any ? (k: U) => void : never
            ) extends (k: infer I) => void
              ? I
              : never;
            type LastOf<T> = UnionToIntersection<
              T extends any ? () => T : never
            > extends () => infer R
              ? R
              : never;

            type Push<T extends any[], V> = [...T, V];

            export type TuplifyUnion<
              T,
              L = LastOf<T>,
              N = [T] extends [never] ? true : false
            > = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>;

            // This is pure magic
            export type MagicArray<TArray extends any[]> =
              NonNullable<TArray> extends (infer TItem)[] ? TItem[] : never;
            export type MagicObject<TElement> =
              NonNullable<TElement> extends (infer TItem)[]
                ? TItem[]
                : NonNullable<TElement> extends Primitive
                ? TElement
                : {
                    [key in keyof TElement as TElement[key] extends never
                      ? never
                      : key]: MagicObject<TElement[key]>;
                  };

            export type StripNeverKeys<TElement> = TElement extends object
              ? {
                  [key in keyof TElement as [TElement[key]] extends [never]
                    ? never
                    : TElement[key] extends never[]
                    ? never
                    : key]: TElement[key];
                }
              : TElement;

            export type ClearObjectWithNeverKeys<
              TElement,
              TStripped = StripNeverKeys<TElement>
            > = [keyof Omit<TElement, keyof TStripped>] extends [never] ? TStripped : never;

            export type StripNeverKeysAddTypename<
              TElement,
              TKey,
              TStripped = ClearObjectWithNeverKeys<TElement>
            > = [keyof TStripped] extends [never]
              ? never
              : TStripped & { __typename: TKey };

            type RetrieveType<TItem> = Exclude<
              TItem,
              Promise<any>
            > extends ResolverTypeWrapper<infer TValue>
              ? TValue extends { __typename?: infer TName }
                ? TItem extends object
                  ? TName extends keyof Resolvers
                    ? \\"__isTypeOf\\" extends keyof RequiredResolvers[TName]
                      ? Omit<RequiredResolvers[TName], \\"__isTypeOf\\"> extends {
                          [key: string]: Resolver<any, any, any, any>;
                        }
                        ? {
                            Model: Exclude<TItem, Promise<any>>;
                            Resolvers: Omit<RequiredResolvers[TName], \\"__isTypeOf\\">;
                          }
                        : never
                      : never
                    : never
                  : never
                : never
              : never;

            export type ResolverReturnType<
              TModel extends object,
              TKey extends keyof TModel,
              TResolvers extends { [key: PropertyKey]: Resolver<any, any, any, any> }
            > = TModel[TKey] extends Primitive
              ? never
              : NonNullable<TResolvers[TKey]> extends Resolver<infer Props, any, any, any>
              ? Props extends (infer TItem)[]
                ? RetrieveType<Exclude<TItem, Promise<any>>>
                : RetrieveType<Exclude<Props, Promise<any>>>
              : never;

            export type ResolverObject = {
              [key: PropertyKey]: Resolver<any, any, any> | Resolver<any, any, any, any>;
            };

            export type ResolveKey<
              TModel extends object,
              TResolvers extends ResolverObject,
              TItem,
              TKey,
              TOmittedElement = TKey extends keyof TItem
                ? Omit<
                    NonNullable<TItem[TKey]>,
                    \\"where\\" | \\"directed\\" | \\"options\\" | \\"after\\" | \\"first\\" | \\"sort\\"
                  >
                : never
            > = TKey extends keyof TModel
              ? NonNullable<TModel[TKey]> extends Primitive
                ? TModel[TKey]
                : ResolverReturnType<TModel, TKey, TResolvers> extends {
                    Model: infer NestedTModel;
                    Resolvers: infer NestedResolvers;
                  }
                ? NestedTModel extends object
                  ? NestedResolvers extends ResolverObject
                    ? TKey extends keyof TItem
                      ? \\"on\\" extends keyof TOmittedElement
                        ?
                            | ({
                                -readonly [key in keyof TOmittedElement[\\"on\\"]]: StripNeverKeysAddTypename<
                                  {
                                    -readonly [K in keyof TOmittedElement[\\"on\\"][key]]: K extends keyof NestedTModel
                                      ? NestedTModel[K] extends any[]
                                        ? MagicArray<
                                            ResolveKey<
                                              NestedTModel,
                                              NestedResolvers,
                                              TOmittedElement[\\"on\\"][key],
                                              K
                                            >[]
                                          >
                                        : ResolveKey<
                                            NestedTModel,
                                            NestedResolvers,
                                            TOmittedElement[\\"on\\"][key],
                                            K
                                          >
                                      : never;
                                  },
                                  key
                                >;
                              }[keyof TOmittedElement[\\"on\\"]] &
                                ResolveKey<
                                  TModel,
                                  TResolvers,
                                  Omit<TItem, TKey> & {
                                    [key in TKey]: Omit<TOmittedElement, \\"on\\">;
                                  },
                                  TKey
                                >)
                            | (undefined extends TModel[TKey]
                                ? NonNullable<TModel[TKey]> extends any[]
                                  ? never
                                  : undefined
                                : never)
                            | (undefined extends TItem[TKey]
                                ? NonNullable<TModel[TKey]> extends any[]
                                  ? never
                                  : undefined
                                : never)
                        : ClearObjectWithNeverKeys<
                            | {
                                -readonly [key in keyof TOmittedElement as key extends keyof NestedTModel
                                  ? key
                                  : never]: key extends keyof NestedTModel
                                  ? NestedTModel[key] extends any[]
                                    ? MagicArray<
                                        ResolveKey<
                                          NestedTModel,
                                          NestedResolvers,
                                          TOmittedElement,
                                          key
                                        >[]
                                      >
                                    : ResolveKey<
                                        NestedTModel,
                                        NestedResolvers,
                                        TOmittedElement,
                                        key
                                      >
                                  : never;
                              }
                            | (undefined extends TModel[TKey]
                                ? NonNullable<TModel[TKey]> extends any[]
                                  ? never
                                  : undefined
                                : never)
                            | (undefined extends TItem[TKey]
                                ? NonNullable<TModel[TKey]> extends any[]
                                  ? never
                                  : undefined
                                : never)
                          >
                      : never
                    : never
                  : TModel[TKey] extends (infer TArrayItem)[]
                  ? NonNullable<TArrayItem> extends Primitive
                    ? TArrayItem
                    : never
                  : never
                : never
              : never;

            //Only if TValue = any, this is true
            export type IsAny<TValue> = unknown extends TValue ? true : false;

            export type NestedBooleanObject<
              TModel extends object,
              TResolvers extends ResolverObject,
              TKey extends keyof TModel,
              TElement,
              RequiredValue extends NonNullable<TElement> = NonNullable<TElement>
            > = IsAny<RequiredValue> extends true
              ? boolean
              : RequiredValue extends object
              ? RequiredValue extends (infer TItem)[]
                ? NonNullable<TItem> extends Primitive
                  ? boolean
                  : {
                      [key in keyof TItem]?: ResolverReturnType<
                        TModel,
                        TKey,
                        TResolvers
                      > extends {
                        Model: infer NestedModel;
                        Resolvers: infer NestedResolvers;
                      }
                        ? NestedModel extends object
                          ? NestedResolvers extends ResolverObject
                            ? key extends keyof NestedModel
                              ? NonNullable<TItem[key]> extends object
                                ? NonNullable<TItem[key]> extends any[]
                                  ? NestedBooleanObject<
                                      NestedModel,
                                      NestedResolvers,
                                      key,
                                      NonNullable<NonNullable<TItem>[key]>
                                    >
                                  : IsAny<NonNullable<TItem[key]>> extends true
                                  ? boolean
                                  : \\"__typename\\" extends keyof NonNullable<TItem[key]>
                                  ? NestedBooleanObject<
                                      NestedModel,
                                      NestedResolvers,
                                      key,
                                      UnionToIntersection<
                                        Omit<
                                          NonNullable<NonNullable<TItem>[key]>,
                                          \\"__typename\\"
                                        >
                                      > & {
                                        __typename: NonNullable<
                                          NonNullable<TItem[key]>[\\"__typename\\"]
                                        >;
                                      }
                                    >
                                  : never
                                : boolean
                              : never
                            : never
                          : never
                        : never;
                    } & ResolverArgs<TModel, TKey, TResolvers> &
                      BooleanOn<TElement>
                : {
                    [key in keyof RequiredValue]?: ResolverReturnType<
                      TModel,
                      TKey,
                      TResolvers
                    > extends { Model: infer NestedModel; Resolvers: infer NestedResolvers }
                      ? NestedModel extends object
                        ? NestedResolvers extends ResolverObject
                          ? key extends keyof NestedModel
                            ? NonNullable<RequiredValue[key]> extends any[]
                              ? NestedBooleanObject<
                                  NestedModel,
                                  NestedResolvers,
                                  key,
                                  NonNullable<RequiredValue[key]>
                                >
                              : NonNullable<RequiredValue[key]> extends object
                              ? IsAny<NonNullable<RequiredValue[key]>> extends true
                                ? boolean
                                : \\"__typename\\" extends keyof NonNullable<RequiredValue[key]>
                                ? NestedBooleanObject<
                                    NestedModel,
                                    NestedResolvers,
                                    key,
                                    UnionToIntersection<
                                      Omit<NonNullable<RequiredValue[key]>, \\"__typename\\">
                                    > & {
                                      __typename: NonNullable<
                                        NonNullable<RequiredValue[key]>[\\"__typename\\"]
                                      >;
                                    }
                                  >
                                : never
                              : boolean
                            : never
                          : never
                        : never
                      : never;
                  } & BooleanOn<TElement> &
                    ResolverArgs<TModel, TKey, TResolvers>
              : boolean;

            export type SelectionSetObject<
              TModel extends object,
              TResolvers extends ResolverObject
            > = {
              [key in keyof TModel]?: NonNullable<TModel[key]> extends Primitive
                ? boolean
                : NonNullable<TModel[key]> extends (infer TItem)[]
                ? \\"__typename\\" extends keyof TItem
                  ? NestedBooleanObject<
                      TModel,
                      TResolvers,
                      key,
                      Prettify<
                        UnionToIntersection<Omit<NonNullable<TItem>, \\"__typename\\">> & {
                          __typename: NonNullable<NonNullable<TItem>[\\"__typename\\"]>;
                        }
                      >
                    >
                  : NonNullable<TItem> extends Primitive
                  ? boolean
                  : never
                : \\"__typename\\" extends keyof NonNullable<TModel[key]>
                ? NestedBooleanObject<
                    TModel,
                    TResolvers,
                    key,
                    Prettify<
                      UnionToIntersection<Omit<NonNullable<TModel[key]>, \\"__typename\\">> & {
                        __typename: NonNullable<NonNullable<TModel[key]>[\\"__typename\\"]>;
                      }
                    >
                  >
                : never;
            };

            type BooleanOn<TElement> = TElement extends { __typename: infer Typename }
              ? TuplifyUnion<NonNullable<Typename>>[\\"length\\"] extends 1
                ? {}
                : NonNullable<Typename> extends string
                ? {
                    on?: {
                      [key in NonNullable<Typename>]?: key extends keyof RequiredResolvers
                        ? key extends keyof ResolversTypes
                          ? Omit<
                              RequiredResolvers[key],
                              \\"__isTypeOf\\"
                            > extends ResolverObject
                            ? {
                                [K in keyof NonNullable<
                                  Exclude<ResolversTypes[key], Promise<any>>
                                >]?: NestedBooleanObject<
                                  NonNullable<Exclude<ResolversTypes[key], Promise<any>>>,
                                  Omit<RequiredResolvers[key], \\"__isTypeOf\\">,
                                  K,
                                  NonNullable<Exclude<ResolversTypes[key], Promise<any>>>[K]
                                >;
                              }
                            : never
                          : never
                        : never;
                    };
                  }
                : never
              : {};

            export type InferFromSelectionSetObject<
              TModel extends object,
              TResolvers extends ResolverObject,
              TSelectionSet extends SelectionSetObject<TModel, TResolvers>
            > = MagicObject<{
              -readonly [key in keyof TSelectionSet]: key extends keyof TModel
                ? NonNullable<TModel[key]> extends any[]
                  ?
                      | ResolveKey<TModel, TResolvers, TSelectionSet, key>[]
                      | (undefined extends TModel[key] ? undefined : never)
                  :
                      | ResolveKey<TModel, TResolvers, TSelectionSet, key>
                      | (undefined extends TModel[key] ? undefined : never)
                : never;
            }>;
            import { GraphQLResolveInfo } from \\"graphql\\";
            export type Maybe<T> = T | null;
            export type InputMaybe<T> = Maybe<T>;
            export type Exact<T extends { [key: string]: unknown }> = {
              [K in keyof T]: T[K];
            };
            export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
              [SubKey in K]?: Maybe<T[SubKey]>;
            };
            export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
              [SubKey in K]: Maybe<T[SubKey]>;
            };
            export type MakeEmpty<
              T extends { [key: string]: unknown },
              K extends keyof T
            > = { [_ in K]?: never };
            export type Incremental<T> =
              | T
              | {
                  [P in keyof T]?: P extends \\" $fragmentName\\" | \\"__typename\\" ? T[P] : never;
                };
            export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
              [P in K]-?: NonNullable<T[P]>;
            };
            /** All built-in and custom scalars, mapped to their actual values */
            export type Scalars = {
              ID: { input: string; output: string };
              /** The \`String\` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text. */
              String: { input: string; output: string };
              /** The \`Boolean\` scalar type represents \`true\` or \`false\`. */
              Boolean: { input: boolean; output: boolean };
              /** The \`Int\` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. */
              Int: { input: number; output: number };
              /** The \`Float\` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point). */
              Float: { input: number; output: number };
            };

            export type Query = {
              __typename?: \\"Query\\";
              movies: Array<Movie>;
              moviesConnection: MoviesConnection;
              moviesAggregate: MovieAggregateSelection;
              people: Array<Person>;
              peopleConnection: PeopleConnection;
              peopleAggregate: PersonAggregateSelection;
            };

            export type QueryMoviesArgs = {
              where?: InputMaybe<MovieWhere>;
              options?: InputMaybe<MovieOptions>;
            };

            export type QueryMoviesConnectionArgs = {
              first?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              after?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              where?: InputMaybe<MovieWhere>;
              sort?: InputMaybe<Array<InputMaybe<MovieSort>>>;
            };

            export type QueryMoviesAggregateArgs = {
              where?: InputMaybe<MovieWhere>;
            };

            export type QueryPeopleArgs = {
              where?: InputMaybe<PersonWhere>;
              options?: InputMaybe<PersonOptions>;
            };

            export type QueryPeopleConnectionArgs = {
              first?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              after?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              where?: InputMaybe<PersonWhere>;
              sort?: InputMaybe<Array<InputMaybe<PersonSort>>>;
            };

            export type QueryPeopleAggregateArgs = {
              where?: InputMaybe<PersonWhere>;
            };

            export type Mutation = {
              __typename?: \\"Mutation\\";
              createMovies: CreateMoviesMutationResponse;
              deleteMovies: DeleteInfo;
              updateMovies: UpdateMoviesMutationResponse;
              createPeople: CreatePeopleMutationResponse;
              deletePeople: DeleteInfo;
              updatePeople: UpdatePeopleMutationResponse;
            };

            export type MutationCreateMoviesArgs = {
              input: Array<MovieCreateInput>;
            };

            export type MutationDeleteMoviesArgs = {
              where?: InputMaybe<MovieWhere>;
              delete?: InputMaybe<MovieDeleteInput>;
            };

            export type MutationUpdateMoviesArgs = {
              where?: InputMaybe<MovieWhere>;
              update?: InputMaybe<MovieUpdateInput>;
              connect?: InputMaybe<MovieConnectInput>;
              disconnect?: InputMaybe<MovieDisconnectInput>;
              create?: InputMaybe<MovieRelationInput>;
              delete?: InputMaybe<MovieDeleteInput>;
            };

            export type MutationCreatePeopleArgs = {
              input: Array<PersonCreateInput>;
            };

            export type MutationDeletePeopleArgs = {
              where?: InputMaybe<PersonWhere>;
            };

            export type MutationUpdatePeopleArgs = {
              where?: InputMaybe<PersonWhere>;
              update?: InputMaybe<PersonUpdateInput>;
            };

            /** An enum for sorting in either ascending or descending order. */
            export enum SortDirection {
              /** Sort by field values in ascending order. */
              Asc = \\"ASC\\",
              /** Sort by field values in descending order. */
              Desc = \\"DESC\\",
            }

            /**
             * The edge properties for the following fields:
             * * Movie.actors
             */
            export type ActedIn = {
              __typename?: \\"ActedIn\\";
              screenTime: Scalars[\\"Int\\"][\\"output\\"];
            };

            /** Information about the number of nodes and relationships created during a create mutation */
            export type CreateInfo = {
              __typename?: \\"CreateInfo\\";
              /** @deprecated This field has been deprecated because bookmarks are now handled by the driver. */
              bookmark?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              nodesCreated: Scalars[\\"Int\\"][\\"output\\"];
              relationshipsCreated: Scalars[\\"Int\\"][\\"output\\"];
            };

            export type CreateMoviesMutationResponse = {
              __typename?: \\"CreateMoviesMutationResponse\\";
              info: CreateInfo;
              movies: Array<Movie>;
            };

            export type CreatePeopleMutationResponse = {
              __typename?: \\"CreatePeopleMutationResponse\\";
              info: CreateInfo;
              people: Array<Person>;
            };

            /** Information about the number of nodes and relationships deleted during a delete mutation */
            export type DeleteInfo = {
              __typename?: \\"DeleteInfo\\";
              /** @deprecated This field has been deprecated because bookmarks are now handled by the driver. */
              bookmark?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              nodesDeleted: Scalars[\\"Int\\"][\\"output\\"];
              relationshipsDeleted: Scalars[\\"Int\\"][\\"output\\"];
            };

            export type IntAggregateSelection = {
              __typename?: \\"IntAggregateSelection\\";
              max?: Maybe<Scalars[\\"Int\\"][\\"output\\"]>;
              min?: Maybe<Scalars[\\"Int\\"][\\"output\\"]>;
              average?: Maybe<Scalars[\\"Float\\"][\\"output\\"]>;
              sum?: Maybe<Scalars[\\"Int\\"][\\"output\\"]>;
            };

            export type Movie = {
              __typename?: \\"Movie\\";
              title: Scalars[\\"String\\"][\\"output\\"];
              actorsAggregate?: Maybe<MoviePersonActorsAggregationSelection>;
              actors: Array<Person>;
              actorsConnection: MovieActorsConnection;
            };

            export type MovieActorsAggregateArgs = {
              where?: InputMaybe<PersonWhere>;
              directed?: InputMaybe<Scalars[\\"Boolean\\"][\\"input\\"]>;
            };

            export type MovieActorsArgs = {
              where?: InputMaybe<PersonWhere>;
              options?: InputMaybe<PersonOptions>;
              directed?: InputMaybe<Scalars[\\"Boolean\\"][\\"input\\"]>;
            };

            export type MovieActorsConnectionArgs = {
              where?: InputMaybe<MovieActorsConnectionWhere>;
              first?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              after?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              directed?: InputMaybe<Scalars[\\"Boolean\\"][\\"input\\"]>;
              sort?: InputMaybe<Array<MovieActorsConnectionSort>>;
            };

            export type MovieActorsConnection = {
              __typename?: \\"MovieActorsConnection\\";
              edges: Array<MovieActorsRelationship>;
              totalCount: Scalars[\\"Int\\"][\\"output\\"];
              pageInfo: PageInfo;
            };

            export type MovieActorsRelationship = {
              __typename?: \\"MovieActorsRelationship\\";
              cursor: Scalars[\\"String\\"][\\"output\\"];
              node: Person;
              properties: ActedIn;
            };

            export type MovieAggregateSelection = {
              __typename?: \\"MovieAggregateSelection\\";
              count: Scalars[\\"Int\\"][\\"output\\"];
              title: StringAggregateSelection;
            };

            export type MovieEdge = {
              __typename?: \\"MovieEdge\\";
              cursor: Scalars[\\"String\\"][\\"output\\"];
              node: Movie;
            };

            export type MoviePersonActorsAggregationSelection = {
              __typename?: \\"MoviePersonActorsAggregationSelection\\";
              count: Scalars[\\"Int\\"][\\"output\\"];
              node?: Maybe<MoviePersonActorsNodeAggregateSelection>;
              edge?: Maybe<MoviePersonActorsEdgeAggregateSelection>;
            };

            export type MoviePersonActorsEdgeAggregateSelection = {
              __typename?: \\"MoviePersonActorsEdgeAggregateSelection\\";
              screenTime: IntAggregateSelection;
            };

            export type MoviePersonActorsNodeAggregateSelection = {
              __typename?: \\"MoviePersonActorsNodeAggregateSelection\\";
              name: StringAggregateSelection;
            };

            export type MoviesConnection = {
              __typename?: \\"MoviesConnection\\";
              totalCount: Scalars[\\"Int\\"][\\"output\\"];
              pageInfo: PageInfo;
              edges: Array<MovieEdge>;
            };

            /** Pagination information (Relay) */
            export type PageInfo = {
              __typename?: \\"PageInfo\\";
              hasNextPage: Scalars[\\"Boolean\\"][\\"output\\"];
              hasPreviousPage: Scalars[\\"Boolean\\"][\\"output\\"];
              startCursor?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              endCursor?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
            };

            export type PeopleConnection = {
              __typename?: \\"PeopleConnection\\";
              totalCount: Scalars[\\"Int\\"][\\"output\\"];
              pageInfo: PageInfo;
              edges: Array<PersonEdge>;
            };

            export type Person = {
              __typename?: \\"Person\\";
              name: Scalars[\\"String\\"][\\"output\\"];
            };

            export type PersonAggregateSelection = {
              __typename?: \\"PersonAggregateSelection\\";
              count: Scalars[\\"Int\\"][\\"output\\"];
              name: StringAggregateSelection;
            };

            export type PersonEdge = {
              __typename?: \\"PersonEdge\\";
              cursor: Scalars[\\"String\\"][\\"output\\"];
              node: Person;
            };

            export type StringAggregateSelection = {
              __typename?: \\"StringAggregateSelection\\";
              shortest?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              longest?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
            };

            /** Information about the number of nodes and relationships created and deleted during an update mutation */
            export type UpdateInfo = {
              __typename?: \\"UpdateInfo\\";
              /** @deprecated This field has been deprecated because bookmarks are now handled by the driver. */
              bookmark?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              nodesCreated: Scalars[\\"Int\\"][\\"output\\"];
              nodesDeleted: Scalars[\\"Int\\"][\\"output\\"];
              relationshipsCreated: Scalars[\\"Int\\"][\\"output\\"];
              relationshipsDeleted: Scalars[\\"Int\\"][\\"output\\"];
            };

            export type UpdateMoviesMutationResponse = {
              __typename?: \\"UpdateMoviesMutationResponse\\";
              info: UpdateInfo;
              movies: Array<Movie>;
            };

            export type UpdatePeopleMutationResponse = {
              __typename?: \\"UpdatePeopleMutationResponse\\";
              info: UpdateInfo;
              people: Array<Person>;
            };

            export type ActedInAggregationWhereInput = {
              AND?: InputMaybe<Array<ActedInAggregationWhereInput>>;
              OR?: InputMaybe<Array<ActedInAggregationWhereInput>>;
              NOT?: InputMaybe<ActedInAggregationWhereInput>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              screenTime_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_MIN_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_MAX_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_SUM_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_AVERAGE_EQUAL?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              screenTime_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_MIN_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_MAX_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_SUM_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_AVERAGE_GT?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              screenTime_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_MIN_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_MAX_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_SUM_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_AVERAGE_GTE?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              screenTime_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_MIN_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_MAX_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_SUM_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_AVERAGE_LT?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              screenTime_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_MIN_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_MAX_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_SUM_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_AVERAGE_LTE?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
            };

            export type ActedInCreateInput = {
              screenTime: Scalars[\\"Int\\"][\\"input\\"];
            };

            export type ActedInSort = {
              screenTime?: InputMaybe<SortDirection>;
            };

            export type ActedInUpdateInput = {
              screenTime?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_INCREMENT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_DECREMENT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
            };

            export type ActedInWhere = {
              screenTime?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              screenTime_NOT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_IN?: InputMaybe<Array<Scalars[\\"Int\\"][\\"input\\"]>>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              screenTime_NOT_IN?: InputMaybe<Array<Scalars[\\"Int\\"][\\"input\\"]>>;
              screenTime_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              screenTime_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              OR?: InputMaybe<Array<ActedInWhere>>;
              AND?: InputMaybe<Array<ActedInWhere>>;
              NOT?: InputMaybe<ActedInWhere>;
            };

            export type MovieActorsAggregateInput = {
              count?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              count_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              count_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              count_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              count_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              AND?: InputMaybe<Array<MovieActorsAggregateInput>>;
              OR?: InputMaybe<Array<MovieActorsAggregateInput>>;
              NOT?: InputMaybe<MovieActorsAggregateInput>;
              node?: InputMaybe<MovieActorsNodeAggregationWhereInput>;
              edge?: InputMaybe<ActedInAggregationWhereInput>;
            };

            export type MovieActorsConnectFieldInput = {
              edge: ActedInCreateInput;
              where?: InputMaybe<PersonConnectWhere>;
              /** Whether or not to overwrite any matching relationship with the new properties. */
              overwrite?: Scalars[\\"Boolean\\"][\\"input\\"];
            };

            export type MovieActorsConnectionSort = {
              node?: InputMaybe<PersonSort>;
              edge?: InputMaybe<ActedInSort>;
            };

            export type MovieActorsConnectionWhere = {
              AND?: InputMaybe<Array<MovieActorsConnectionWhere>>;
              OR?: InputMaybe<Array<MovieActorsConnectionWhere>>;
              NOT?: InputMaybe<MovieActorsConnectionWhere>;
              node?: InputMaybe<PersonWhere>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              node_NOT?: InputMaybe<PersonWhere>;
              edge?: InputMaybe<ActedInWhere>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              edge_NOT?: InputMaybe<ActedInWhere>;
            };

            export type MovieActorsCreateFieldInput = {
              edge: ActedInCreateInput;
              node: PersonCreateInput;
            };

            export type MovieActorsDeleteFieldInput = {
              where?: InputMaybe<MovieActorsConnectionWhere>;
            };

            export type MovieActorsDisconnectFieldInput = {
              where?: InputMaybe<MovieActorsConnectionWhere>;
            };

            export type MovieActorsFieldInput = {
              connect?: InputMaybe<Array<MovieActorsConnectFieldInput>>;
              create?: InputMaybe<Array<MovieActorsCreateFieldInput>>;
            };

            export type MovieActorsNodeAggregationWhereInput = {
              AND?: InputMaybe<Array<MovieActorsNodeAggregationWhereInput>>;
              OR?: InputMaybe<Array<MovieActorsNodeAggregationWhereInput>>;
              NOT?: InputMaybe<MovieActorsNodeAggregationWhereInput>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              name_EQUAL?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_AVERAGE_EQUAL?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_LONGEST_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_SHORTEST_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              name_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              name_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              name_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              name_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_AVERAGE_GT?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_LONGEST_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_SHORTEST_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              name_AVERAGE_LENGTH_GT?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              name_LONGEST_LENGTH_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              name_SHORTEST_LENGTH_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              name_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_AVERAGE_GTE?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_LONGEST_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_SHORTEST_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              name_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              name_LONGEST_LENGTH_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              name_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              name_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_AVERAGE_LT?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_LONGEST_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_SHORTEST_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              name_AVERAGE_LENGTH_LT?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              name_LONGEST_LENGTH_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              name_SHORTEST_LENGTH_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              name_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_AVERAGE_LTE?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_LONGEST_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_SHORTEST_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              name_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              name_LONGEST_LENGTH_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              name_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
            };

            export type MovieActorsUpdateConnectionInput = {
              node?: InputMaybe<PersonUpdateInput>;
              edge?: InputMaybe<ActedInUpdateInput>;
            };

            export type MovieActorsUpdateFieldInput = {
              where?: InputMaybe<MovieActorsConnectionWhere>;
              connect?: InputMaybe<Array<MovieActorsConnectFieldInput>>;
              disconnect?: InputMaybe<Array<MovieActorsDisconnectFieldInput>>;
              create?: InputMaybe<Array<MovieActorsCreateFieldInput>>;
              update?: InputMaybe<MovieActorsUpdateConnectionInput>;
              delete?: InputMaybe<Array<MovieActorsDeleteFieldInput>>;
            };

            export type MovieConnectInput = {
              actors?: InputMaybe<Array<MovieActorsConnectFieldInput>>;
            };

            export type MovieCreateInput = {
              title: Scalars[\\"String\\"][\\"input\\"];
              actors?: InputMaybe<MovieActorsFieldInput>;
            };

            export type MovieDeleteInput = {
              actors?: InputMaybe<Array<MovieActorsDeleteFieldInput>>;
            };

            export type MovieDisconnectInput = {
              actors?: InputMaybe<Array<MovieActorsDisconnectFieldInput>>;
            };

            export type MovieOptions = {
              limit?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              offset?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** Specify one or more MovieSort objects to sort Movies by. The sorts will be applied in the order in which they are arranged in the array. */
              sort?: InputMaybe<Array<MovieSort>>;
            };

            export type MovieRelationInput = {
              actors?: InputMaybe<Array<MovieActorsCreateFieldInput>>;
            };

            /** Fields to sort Movies by. The order in which sorts are applied is not guaranteed when specifying many fields in one MovieSort object. */
            export type MovieSort = {
              title?: InputMaybe<SortDirection>;
            };

            export type MovieUpdateInput = {
              title?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              actors?: InputMaybe<Array<MovieActorsUpdateFieldInput>>;
            };

            export type MovieWhere = {
              title?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              title_NOT?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              title_IN?: InputMaybe<Array<Scalars[\\"String\\"][\\"input\\"]>>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              title_NOT_IN?: InputMaybe<Array<Scalars[\\"String\\"][\\"input\\"]>>;
              title_CONTAINS?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              title_STARTS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              title_ENDS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              title_NOT_CONTAINS?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              title_NOT_STARTS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              title_NOT_ENDS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              OR?: InputMaybe<Array<MovieWhere>>;
              AND?: InputMaybe<Array<MovieWhere>>;
              NOT?: InputMaybe<MovieWhere>;
              /** @deprecated Use \`actors_SOME\` instead. */
              actors?: InputMaybe<PersonWhere>;
              /** @deprecated Use \`actors_NONE\` instead. */
              actors_NOT?: InputMaybe<PersonWhere>;
              /** Return Movies where all of the related People match this filter */
              actors_ALL?: InputMaybe<PersonWhere>;
              /** Return Movies where none of the related People match this filter */
              actors_NONE?: InputMaybe<PersonWhere>;
              /** Return Movies where one of the related People match this filter */
              actors_SINGLE?: InputMaybe<PersonWhere>;
              /** Return Movies where some of the related People match this filter */
              actors_SOME?: InputMaybe<PersonWhere>;
              /** @deprecated Use \`actorsConnection_SOME\` instead. */
              actorsConnection?: InputMaybe<MovieActorsConnectionWhere>;
              /** @deprecated Use \`actorsConnection_NONE\` instead. */
              actorsConnection_NOT?: InputMaybe<MovieActorsConnectionWhere>;
              /** Return Movies where all of the related MovieActorsConnections match this filter */
              actorsConnection_ALL?: InputMaybe<MovieActorsConnectionWhere>;
              /** Return Movies where none of the related MovieActorsConnections match this filter */
              actorsConnection_NONE?: InputMaybe<MovieActorsConnectionWhere>;
              /** Return Movies where one of the related MovieActorsConnections match this filter */
              actorsConnection_SINGLE?: InputMaybe<MovieActorsConnectionWhere>;
              /** Return Movies where some of the related MovieActorsConnections match this filter */
              actorsConnection_SOME?: InputMaybe<MovieActorsConnectionWhere>;
              actorsAggregate?: InputMaybe<MovieActorsAggregateInput>;
            };

            export type PersonConnectWhere = {
              node: PersonWhere;
            };

            export type PersonCreateInput = {
              name: Scalars[\\"String\\"][\\"input\\"];
            };

            export type PersonOptions = {
              limit?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              offset?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** Specify one or more PersonSort objects to sort People by. The sorts will be applied in the order in which they are arranged in the array. */
              sort?: InputMaybe<Array<PersonSort>>;
            };

            /** Fields to sort People by. The order in which sorts are applied is not guaranteed when specifying many fields in one PersonSort object. */
            export type PersonSort = {
              name?: InputMaybe<SortDirection>;
            };

            export type PersonUpdateInput = {
              name?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
            };

            export type PersonWhere = {
              name?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              name_IN?: InputMaybe<Array<Scalars[\\"String\\"][\\"input\\"]>>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT_IN?: InputMaybe<Array<Scalars[\\"String\\"][\\"input\\"]>>;
              name_CONTAINS?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              name_STARTS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              name_ENDS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT_CONTAINS?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT_STARTS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT_ENDS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              OR?: InputMaybe<Array<PersonWhere>>;
              AND?: InputMaybe<Array<PersonWhere>>;
              NOT?: InputMaybe<PersonWhere>;
            };

            export type ResolverTypeWrapper<T> = Promise<T> | T;

            export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
              resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
            };
            export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
              | ResolverFn<TResult, TParent, TContext, TArgs>
              | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

            export type ResolverFn<TResult, TParent, TContext, TArgs> = (
              parent: TParent,
              args: TArgs,
              context: TContext,
              info: GraphQLResolveInfo
            ) => Promise<TResult> | TResult;

            export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
              parent: TParent,
              args: TArgs,
              context: TContext,
              info: GraphQLResolveInfo
            ) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

            export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
              parent: TParent,
              args: TArgs,
              context: TContext,
              info: GraphQLResolveInfo
            ) => TResult | Promise<TResult>;

            export interface SubscriptionSubscriberObject<
              TResult,
              TKey extends string,
              TParent,
              TContext,
              TArgs
            > {
              subscribe: SubscriptionSubscribeFn<
                { [key in TKey]: TResult },
                TParent,
                TContext,
                TArgs
              >;
              resolve?: SubscriptionResolveFn<
                TResult,
                { [key in TKey]: TResult },
                TContext,
                TArgs
              >;
            }

            export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
              subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
              resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
            }

            export type SubscriptionObject<
              TResult,
              TKey extends string,
              TParent,
              TContext,
              TArgs
            > =
              | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
              | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

            export type SubscriptionResolver<
              TResult,
              TKey extends string,
              TParent = {},
              TContext = {},
              TArgs = {}
            > =
              | ((
                  ...args: any[]
                ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
              | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

            export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
              parent: TParent,
              context: TContext,
              info: GraphQLResolveInfo
            ) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

            export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
              obj: T,
              context: TContext,
              info: GraphQLResolveInfo
            ) => boolean | Promise<boolean>;

            export type NextResolverFn<T> = () => Promise<T>;

            export type DirectiveResolverFn<
              TResult = {},
              TParent = {},
              TContext = {},
              TArgs = {}
            > = (
              next: NextResolverFn<TResult>,
              parent: TParent,
              args: TArgs,
              context: TContext,
              info: GraphQLResolveInfo
            ) => TResult | Promise<TResult>;

            /** Mapping between all available schema types and the resolvers types */
            export type ResolversTypes = {
              Query: ResolverTypeWrapper<{}>;
              Int: ResolverTypeWrapper<Scalars[\\"Int\\"][\\"output\\"]>;
              String: ResolverTypeWrapper<Scalars[\\"String\\"][\\"output\\"]>;
              Mutation: ResolverTypeWrapper<{}>;
              SortDirection: SortDirection;
              ActedIn: ResolverTypeWrapper<ActedIn>;
              CreateInfo: ResolverTypeWrapper<CreateInfo>;
              CreateMoviesMutationResponse: ResolverTypeWrapper<CreateMoviesMutationResponse>;
              CreatePeopleMutationResponse: ResolverTypeWrapper<CreatePeopleMutationResponse>;
              DeleteInfo: ResolverTypeWrapper<DeleteInfo>;
              IntAggregateSelection: ResolverTypeWrapper<IntAggregateSelection>;
              Float: ResolverTypeWrapper<Scalars[\\"Float\\"][\\"output\\"]>;
              Movie: ResolverTypeWrapper<Movie>;
              Boolean: ResolverTypeWrapper<Scalars[\\"Boolean\\"][\\"output\\"]>;
              MovieActorsConnection: ResolverTypeWrapper<MovieActorsConnection>;
              MovieActorsRelationship: ResolverTypeWrapper<MovieActorsRelationship>;
              MovieAggregateSelection: ResolverTypeWrapper<MovieAggregateSelection>;
              MovieEdge: ResolverTypeWrapper<MovieEdge>;
              MoviePersonActorsAggregationSelection: ResolverTypeWrapper<MoviePersonActorsAggregationSelection>;
              MoviePersonActorsEdgeAggregateSelection: ResolverTypeWrapper<MoviePersonActorsEdgeAggregateSelection>;
              MoviePersonActorsNodeAggregateSelection: ResolverTypeWrapper<MoviePersonActorsNodeAggregateSelection>;
              MoviesConnection: ResolverTypeWrapper<MoviesConnection>;
              PageInfo: ResolverTypeWrapper<PageInfo>;
              PeopleConnection: ResolverTypeWrapper<PeopleConnection>;
              Person: ResolverTypeWrapper<Person>;
              PersonAggregateSelection: ResolverTypeWrapper<PersonAggregateSelection>;
              PersonEdge: ResolverTypeWrapper<PersonEdge>;
              StringAggregateSelection: ResolverTypeWrapper<StringAggregateSelection>;
              UpdateInfo: ResolverTypeWrapper<UpdateInfo>;
              UpdateMoviesMutationResponse: ResolverTypeWrapper<UpdateMoviesMutationResponse>;
              UpdatePeopleMutationResponse: ResolverTypeWrapper<UpdatePeopleMutationResponse>;
              ActedInAggregationWhereInput: ActedInAggregationWhereInput;
              ActedInCreateInput: ActedInCreateInput;
              ActedInSort: ActedInSort;
              ActedInUpdateInput: ActedInUpdateInput;
              ActedInWhere: ActedInWhere;
              MovieActorsAggregateInput: MovieActorsAggregateInput;
              MovieActorsConnectFieldInput: MovieActorsConnectFieldInput;
              MovieActorsConnectionSort: MovieActorsConnectionSort;
              MovieActorsConnectionWhere: MovieActorsConnectionWhere;
              MovieActorsCreateFieldInput: MovieActorsCreateFieldInput;
              MovieActorsDeleteFieldInput: MovieActorsDeleteFieldInput;
              MovieActorsDisconnectFieldInput: MovieActorsDisconnectFieldInput;
              MovieActorsFieldInput: MovieActorsFieldInput;
              MovieActorsNodeAggregationWhereInput: MovieActorsNodeAggregationWhereInput;
              MovieActorsUpdateConnectionInput: MovieActorsUpdateConnectionInput;
              MovieActorsUpdateFieldInput: MovieActorsUpdateFieldInput;
              MovieConnectInput: MovieConnectInput;
              MovieCreateInput: MovieCreateInput;
              MovieDeleteInput: MovieDeleteInput;
              MovieDisconnectInput: MovieDisconnectInput;
              MovieOptions: MovieOptions;
              MovieRelationInput: MovieRelationInput;
              MovieSort: MovieSort;
              MovieUpdateInput: MovieUpdateInput;
              MovieWhere: MovieWhere;
              PersonConnectWhere: PersonConnectWhere;
              PersonCreateInput: PersonCreateInput;
              PersonOptions: PersonOptions;
              PersonSort: PersonSort;
              PersonUpdateInput: PersonUpdateInput;
              PersonWhere: PersonWhere;
            };

            /** Mapping between all available schema types and the resolvers parents */
            export type ResolversParentTypes = {
              Query: {};
              Int: Scalars[\\"Int\\"][\\"output\\"];
              String: Scalars[\\"String\\"][\\"output\\"];
              Mutation: {};
              ActedIn: ActedIn;
              CreateInfo: CreateInfo;
              CreateMoviesMutationResponse: CreateMoviesMutationResponse;
              CreatePeopleMutationResponse: CreatePeopleMutationResponse;
              DeleteInfo: DeleteInfo;
              IntAggregateSelection: IntAggregateSelection;
              Float: Scalars[\\"Float\\"][\\"output\\"];
              Movie: Movie;
              Boolean: Scalars[\\"Boolean\\"][\\"output\\"];
              MovieActorsConnection: MovieActorsConnection;
              MovieActorsRelationship: MovieActorsRelationship;
              MovieAggregateSelection: MovieAggregateSelection;
              MovieEdge: MovieEdge;
              MoviePersonActorsAggregationSelection: MoviePersonActorsAggregationSelection;
              MoviePersonActorsEdgeAggregateSelection: MoviePersonActorsEdgeAggregateSelection;
              MoviePersonActorsNodeAggregateSelection: MoviePersonActorsNodeAggregateSelection;
              MoviesConnection: MoviesConnection;
              PageInfo: PageInfo;
              PeopleConnection: PeopleConnection;
              Person: Person;
              PersonAggregateSelection: PersonAggregateSelection;
              PersonEdge: PersonEdge;
              StringAggregateSelection: StringAggregateSelection;
              UpdateInfo: UpdateInfo;
              UpdateMoviesMutationResponse: UpdateMoviesMutationResponse;
              UpdatePeopleMutationResponse: UpdatePeopleMutationResponse;
              ActedInAggregationWhereInput: ActedInAggregationWhereInput;
              ActedInCreateInput: ActedInCreateInput;
              ActedInSort: ActedInSort;
              ActedInUpdateInput: ActedInUpdateInput;
              ActedInWhere: ActedInWhere;
              MovieActorsAggregateInput: MovieActorsAggregateInput;
              MovieActorsConnectFieldInput: MovieActorsConnectFieldInput;
              MovieActorsConnectionSort: MovieActorsConnectionSort;
              MovieActorsConnectionWhere: MovieActorsConnectionWhere;
              MovieActorsCreateFieldInput: MovieActorsCreateFieldInput;
              MovieActorsDeleteFieldInput: MovieActorsDeleteFieldInput;
              MovieActorsDisconnectFieldInput: MovieActorsDisconnectFieldInput;
              MovieActorsFieldInput: MovieActorsFieldInput;
              MovieActorsNodeAggregationWhereInput: MovieActorsNodeAggregationWhereInput;
              MovieActorsUpdateConnectionInput: MovieActorsUpdateConnectionInput;
              MovieActorsUpdateFieldInput: MovieActorsUpdateFieldInput;
              MovieConnectInput: MovieConnectInput;
              MovieCreateInput: MovieCreateInput;
              MovieDeleteInput: MovieDeleteInput;
              MovieDisconnectInput: MovieDisconnectInput;
              MovieOptions: MovieOptions;
              MovieRelationInput: MovieRelationInput;
              MovieSort: MovieSort;
              MovieUpdateInput: MovieUpdateInput;
              MovieWhere: MovieWhere;
              PersonConnectWhere: PersonConnectWhere;
              PersonCreateInput: PersonCreateInput;
              PersonOptions: PersonOptions;
              PersonSort: PersonSort;
              PersonUpdateInput: PersonUpdateInput;
              PersonWhere: PersonWhere;
            };

            export type QueryResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"Query\\"] = ResolversParentTypes[\\"Query\\"]
            > = {
              movies?: Resolver<
                Array<ResolversTypes[\\"Movie\\"]>,
                ParentType,
                ContextType,
                Partial<QueryMoviesArgs>
              >;
              moviesConnection?: Resolver<
                ResolversTypes[\\"MoviesConnection\\"],
                ParentType,
                ContextType,
                Partial<QueryMoviesConnectionArgs>
              >;
              moviesAggregate?: Resolver<
                ResolversTypes[\\"MovieAggregateSelection\\"],
                ParentType,
                ContextType,
                Partial<QueryMoviesAggregateArgs>
              >;
              people?: Resolver<
                Array<ResolversTypes[\\"Person\\"]>,
                ParentType,
                ContextType,
                Partial<QueryPeopleArgs>
              >;
              peopleConnection?: Resolver<
                ResolversTypes[\\"PeopleConnection\\"],
                ParentType,
                ContextType,
                Partial<QueryPeopleConnectionArgs>
              >;
              peopleAggregate?: Resolver<
                ResolversTypes[\\"PersonAggregateSelection\\"],
                ParentType,
                ContextType,
                Partial<QueryPeopleAggregateArgs>
              >;
            };

            export type MutationResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"Mutation\\"] = ResolversParentTypes[\\"Mutation\\"]
            > = {
              createMovies?: Resolver<
                ResolversTypes[\\"CreateMoviesMutationResponse\\"],
                ParentType,
                ContextType,
                RequireFields<MutationCreateMoviesArgs, \\"input\\">
              >;
              deleteMovies?: Resolver<
                ResolversTypes[\\"DeleteInfo\\"],
                ParentType,
                ContextType,
                Partial<MutationDeleteMoviesArgs>
              >;
              updateMovies?: Resolver<
                ResolversTypes[\\"UpdateMoviesMutationResponse\\"],
                ParentType,
                ContextType,
                Partial<MutationUpdateMoviesArgs>
              >;
              createPeople?: Resolver<
                ResolversTypes[\\"CreatePeopleMutationResponse\\"],
                ParentType,
                ContextType,
                RequireFields<MutationCreatePeopleArgs, \\"input\\">
              >;
              deletePeople?: Resolver<
                ResolversTypes[\\"DeleteInfo\\"],
                ParentType,
                ContextType,
                Partial<MutationDeletePeopleArgs>
              >;
              updatePeople?: Resolver<
                ResolversTypes[\\"UpdatePeopleMutationResponse\\"],
                ParentType,
                ContextType,
                Partial<MutationUpdatePeopleArgs>
              >;
            };

            export type ActedInResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"ActedIn\\"] = ResolversParentTypes[\\"ActedIn\\"]
            > = {
              screenTime?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type CreateInfoResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"CreateInfo\\"] = ResolversParentTypes[\\"CreateInfo\\"]
            > = {
              bookmark?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              nodesCreated?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              relationshipsCreated?: Resolver<
                ResolversTypes[\\"Int\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type CreateMoviesMutationResponseResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"CreateMoviesMutationResponse\\"] = ResolversParentTypes[\\"CreateMoviesMutationResponse\\"]
            > = {
              info?: Resolver<ResolversTypes[\\"CreateInfo\\"], ParentType, ContextType>;
              movies?: Resolver<Array<ResolversTypes[\\"Movie\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type CreatePeopleMutationResponseResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"CreatePeopleMutationResponse\\"] = ResolversParentTypes[\\"CreatePeopleMutationResponse\\"]
            > = {
              info?: Resolver<ResolversTypes[\\"CreateInfo\\"], ParentType, ContextType>;
              people?: Resolver<Array<ResolversTypes[\\"Person\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type DeleteInfoResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"DeleteInfo\\"] = ResolversParentTypes[\\"DeleteInfo\\"]
            > = {
              bookmark?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              nodesDeleted?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              relationshipsDeleted?: Resolver<
                ResolversTypes[\\"Int\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type IntAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"IntAggregateSelection\\"] = ResolversParentTypes[\\"IntAggregateSelection\\"]
            > = {
              max?: Resolver<Maybe<ResolversTypes[\\"Int\\"]>, ParentType, ContextType>;
              min?: Resolver<Maybe<ResolversTypes[\\"Int\\"]>, ParentType, ContextType>;
              average?: Resolver<Maybe<ResolversTypes[\\"Float\\"]>, ParentType, ContextType>;
              sum?: Resolver<Maybe<ResolversTypes[\\"Int\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type MovieResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"Movie\\"] = ResolversParentTypes[\\"Movie\\"]
            > = {
              title?: Resolver<ResolversTypes[\\"String\\"], ParentType, ContextType>;
              actorsAggregate?: Resolver<
                Maybe<ResolversTypes[\\"MoviePersonActorsAggregationSelection\\"]>,
                ParentType,
                ContextType,
                RequireFields<MovieActorsAggregateArgs, \\"directed\\">
              >;
              actors?: Resolver<
                Array<ResolversTypes[\\"Person\\"]>,
                ParentType,
                ContextType,
                RequireFields<MovieActorsArgs, \\"directed\\">
              >;
              actorsConnection?: Resolver<
                ResolversTypes[\\"MovieActorsConnection\\"],
                ParentType,
                ContextType,
                RequireFields<MovieActorsConnectionArgs, \\"directed\\">
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type MovieActorsConnectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"MovieActorsConnection\\"] = ResolversParentTypes[\\"MovieActorsConnection\\"]
            > = {
              edges?: Resolver<
                Array<ResolversTypes[\\"MovieActorsRelationship\\"]>,
                ParentType,
                ContextType
              >;
              totalCount?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              pageInfo?: Resolver<ResolversTypes[\\"PageInfo\\"], ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type MovieActorsRelationshipResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"MovieActorsRelationship\\"] = ResolversParentTypes[\\"MovieActorsRelationship\\"]
            > = {
              cursor?: Resolver<ResolversTypes[\\"String\\"], ParentType, ContextType>;
              node?: Resolver<ResolversTypes[\\"Person\\"], ParentType, ContextType>;
              properties?: Resolver<ResolversTypes[\\"ActedIn\\"], ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type MovieAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"MovieAggregateSelection\\"] = ResolversParentTypes[\\"MovieAggregateSelection\\"]
            > = {
              count?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              title?: Resolver<
                ResolversTypes[\\"StringAggregateSelection\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type MovieEdgeResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"MovieEdge\\"] = ResolversParentTypes[\\"MovieEdge\\"]
            > = {
              cursor?: Resolver<ResolversTypes[\\"String\\"], ParentType, ContextType>;
              node?: Resolver<ResolversTypes[\\"Movie\\"], ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type MoviePersonActorsAggregationSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"MoviePersonActorsAggregationSelection\\"] = ResolversParentTypes[\\"MoviePersonActorsAggregationSelection\\"]
            > = {
              count?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              node?: Resolver<
                Maybe<ResolversTypes[\\"MoviePersonActorsNodeAggregateSelection\\"]>,
                ParentType,
                ContextType
              >;
              edge?: Resolver<
                Maybe<ResolversTypes[\\"MoviePersonActorsEdgeAggregateSelection\\"]>,
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type MoviePersonActorsEdgeAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"MoviePersonActorsEdgeAggregateSelection\\"] = ResolversParentTypes[\\"MoviePersonActorsEdgeAggregateSelection\\"]
            > = {
              screenTime?: Resolver<
                ResolversTypes[\\"IntAggregateSelection\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type MoviePersonActorsNodeAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"MoviePersonActorsNodeAggregateSelection\\"] = ResolversParentTypes[\\"MoviePersonActorsNodeAggregateSelection\\"]
            > = {
              name?: Resolver<
                ResolversTypes[\\"StringAggregateSelection\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type MoviesConnectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"MoviesConnection\\"] = ResolversParentTypes[\\"MoviesConnection\\"]
            > = {
              totalCount?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              pageInfo?: Resolver<ResolversTypes[\\"PageInfo\\"], ParentType, ContextType>;
              edges?: Resolver<Array<ResolversTypes[\\"MovieEdge\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type PageInfoResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"PageInfo\\"] = ResolversParentTypes[\\"PageInfo\\"]
            > = {
              hasNextPage?: Resolver<ResolversTypes[\\"Boolean\\"], ParentType, ContextType>;
              hasPreviousPage?: Resolver<
                ResolversTypes[\\"Boolean\\"],
                ParentType,
                ContextType
              >;
              startCursor?: Resolver<
                Maybe<ResolversTypes[\\"String\\"]>,
                ParentType,
                ContextType
              >;
              endCursor?: Resolver<
                Maybe<ResolversTypes[\\"String\\"]>,
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type PeopleConnectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"PeopleConnection\\"] = ResolversParentTypes[\\"PeopleConnection\\"]
            > = {
              totalCount?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              pageInfo?: Resolver<ResolversTypes[\\"PageInfo\\"], ParentType, ContextType>;
              edges?: Resolver<
                Array<ResolversTypes[\\"PersonEdge\\"]>,
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type PersonResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"Person\\"] = ResolversParentTypes[\\"Person\\"]
            > = {
              name?: Resolver<ResolversTypes[\\"String\\"], ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type PersonAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"PersonAggregateSelection\\"] = ResolversParentTypes[\\"PersonAggregateSelection\\"]
            > = {
              count?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              name?: Resolver<
                ResolversTypes[\\"StringAggregateSelection\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type PersonEdgeResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"PersonEdge\\"] = ResolversParentTypes[\\"PersonEdge\\"]
            > = {
              cursor?: Resolver<ResolversTypes[\\"String\\"], ParentType, ContextType>;
              node?: Resolver<ResolversTypes[\\"Person\\"], ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type StringAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"StringAggregateSelection\\"] = ResolversParentTypes[\\"StringAggregateSelection\\"]
            > = {
              shortest?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              longest?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UpdateInfoResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UpdateInfo\\"] = ResolversParentTypes[\\"UpdateInfo\\"]
            > = {
              bookmark?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              nodesCreated?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              nodesDeleted?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              relationshipsCreated?: Resolver<
                ResolversTypes[\\"Int\\"],
                ParentType,
                ContextType
              >;
              relationshipsDeleted?: Resolver<
                ResolversTypes[\\"Int\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UpdateMoviesMutationResponseResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UpdateMoviesMutationResponse\\"] = ResolversParentTypes[\\"UpdateMoviesMutationResponse\\"]
            > = {
              info?: Resolver<ResolversTypes[\\"UpdateInfo\\"], ParentType, ContextType>;
              movies?: Resolver<Array<ResolversTypes[\\"Movie\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UpdatePeopleMutationResponseResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UpdatePeopleMutationResponse\\"] = ResolversParentTypes[\\"UpdatePeopleMutationResponse\\"]
            > = {
              info?: Resolver<ResolversTypes[\\"UpdateInfo\\"], ParentType, ContextType>;
              people?: Resolver<Array<ResolversTypes[\\"Person\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type Resolvers<ContextType = any> = {
              Query?: QueryResolvers<ContextType>;
              Mutation?: MutationResolvers<ContextType>;
              ActedIn?: ActedInResolvers<ContextType>;
              CreateInfo?: CreateInfoResolvers<ContextType>;
              CreateMoviesMutationResponse?: CreateMoviesMutationResponseResolvers<ContextType>;
              CreatePeopleMutationResponse?: CreatePeopleMutationResponseResolvers<ContextType>;
              DeleteInfo?: DeleteInfoResolvers<ContextType>;
              IntAggregateSelection?: IntAggregateSelectionResolvers<ContextType>;
              Movie?: MovieResolvers<ContextType>;
              MovieActorsConnection?: MovieActorsConnectionResolvers<ContextType>;
              MovieActorsRelationship?: MovieActorsRelationshipResolvers<ContextType>;
              MovieAggregateSelection?: MovieAggregateSelectionResolvers<ContextType>;
              MovieEdge?: MovieEdgeResolvers<ContextType>;
              MoviePersonActorsAggregationSelection?: MoviePersonActorsAggregationSelectionResolvers<ContextType>;
              MoviePersonActorsEdgeAggregateSelection?: MoviePersonActorsEdgeAggregateSelectionResolvers<ContextType>;
              MoviePersonActorsNodeAggregateSelection?: MoviePersonActorsNodeAggregateSelectionResolvers<ContextType>;
              MoviesConnection?: MoviesConnectionResolvers<ContextType>;
              PageInfo?: PageInfoResolvers<ContextType>;
              PeopleConnection?: PeopleConnectionResolvers<ContextType>;
              Person?: PersonResolvers<ContextType>;
              PersonAggregateSelection?: PersonAggregateSelectionResolvers<ContextType>;
              PersonEdge?: PersonEdgeResolvers<ContextType>;
              StringAggregateSelection?: StringAggregateSelectionResolvers<ContextType>;
              UpdateInfo?: UpdateInfoResolvers<ContextType>;
              UpdateMoviesMutationResponse?: UpdateMoviesMutationResponseResolvers<ContextType>;
              UpdatePeopleMutationResponse?: UpdatePeopleMutationResponseResolvers<ContextType>;
            };

            export interface MovieAggregateSelectionInput {
              count?: boolean;
              title?: boolean;
            }

            export type MovieSelectionSet = SelectionSetObject<Movie, MovieResolvers>;
            export type InferFromMovieSelectionSet<
              TSelectionSet extends MovieSelectionSet
            > = InferFromSelectionSetObject<Movie, MovieResolvers, TSelectionSet>;

            export declare class MovieModel {
              public find(args?: {
                where?: MovieWhere;

                options?: MovieOptions;
                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<Movie[]>;
              public findSafe<TSelectionSet extends MovieSelectionSet>(args?: {
                where?: MovieWhere;

                options?: MovieOptions;
                selectionSet?: TSelectionSet;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<Prettify<InferFromMovieSelectionSet<TSelectionSet>>[]>;
              public create(args: {
                input: MovieCreateInput[];
                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<CreateMoviesMutationResponse>;
              public update(args: {
                where?: MovieWhere;
                update?: MovieUpdateInput;
                connect?: MovieConnectInput;
                disconnect?: MovieDisconnectInput;
                create?: MovieCreateInput;

                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<UpdateMoviesMutationResponse>;
              public delete(args: {
                where?: MovieWhere;
                delete?: MovieDeleteInput;
                context?: any;
                rootValue?: any;
              }): Promise<{ nodesDeleted: number; relationshipsDeleted: number }>;
              public aggregate(args: {
                where?: MovieWhere;

                aggregate: MovieAggregateSelectionInput;
                context?: any;
                rootValue?: any;
              }): Promise<MovieAggregateSelection>;
            }

            export interface PersonAggregateSelectionInput {
              count?: boolean;
              name?: boolean;
            }

            export type PersonSelectionSet = SelectionSetObject<Person, PersonResolvers>;
            export type InferFromPersonSelectionSet<
              TSelectionSet extends PersonSelectionSet
            > = InferFromSelectionSetObject<Person, PersonResolvers, TSelectionSet>;

            export declare class PersonModel {
              public find(args?: {
                where?: PersonWhere;

                options?: PersonOptions;
                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<Person[]>;
              public findSafe<TSelectionSet extends PersonSelectionSet>(args?: {
                where?: PersonWhere;

                options?: PersonOptions;
                selectionSet?: TSelectionSet;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<Prettify<InferFromPersonSelectionSet<TSelectionSet>>[]>;
              public create(args: {
                input: PersonCreateInput[];
                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<CreatePeopleMutationResponse>;
              public update(args: {
                where?: PersonWhere;
                update?: PersonUpdateInput;

                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<UpdatePeopleMutationResponse>;
              public delete(args: {
                where?: PersonWhere;

                context?: any;
                rootValue?: any;
              }): Promise<{ nodesDeleted: number; relationshipsDeleted: number }>;
              public aggregate(args: {
                where?: PersonWhere;

                aggregate: PersonAggregateSelectionInput;
                context?: any;
                rootValue?: any;
              }): Promise<PersonAggregateSelection>;
            }

            export interface ModelMap {
              Movie: MovieModel;
              Person: PersonModel;
            }
            "
        `);
    });

    test("should throw outFile or noWrite required", async () => {
        const typeDefs = `
          type User {
              name: String
          }
        `;

        const ogm = new OGM({
            typeDefs,
            // @ts-ignore
            driver: {},
        });

        await expect(() =>
            generate({
                ogm,
            })
        ).rejects.toThrow("outFile or noWrite required");
    });

    test("https://github.com/neo4j/graphql/issues/3539", async () => {
        const typeDefs = /* GraphQL */ `
            type FAQ {
                id: ID! @id @unique
                activated: Boolean!
                name: String!
                entries: [FAQEntry!]!
                    @relationship(type: "FAQ_ENTRY_IN_FAQ", properties: "FaqEntryInFaq", direction: IN)
            }

            type FAQEntry {
                id: ID! @id @unique
                title: String!
                body: String!
                inFAQs: [FAQ!]! @relationship(type: "FAQ_ENTRY_IN_FAQ", properties: "FaqEntryInFaq", direction: OUT)
            }

            type FaqEntryInFaq @relationshipProperties {
                position: Int
            }
        `;

        const ogm = new OGM({
            typeDefs,
            // @ts-ignore
            driver: {},
        });

        const generated = (await generate({
            ogm,
            noWrite: true,
        })) as string;

        expect(generated).toMatchInlineSnapshot(`
            "import type { SelectionSetNode, DocumentNode } from \\"graphql\\";
            import type { RawGQL } from \\"@efebia/neo4j-graphql-ogm\\";
            export type RequiredResolvers = Required<Resolvers>;
            export type Primitive = string | number | boolean;
            export type Prettify<T> = {
              [K in keyof T]: T[K];
            } & {};
            export type AddRawGQL<T> = NonNullable<T> extends (infer TItem)[]
              ? (TItem | RawGQL)[]
              : NonNullable<T> extends Primitive
              ? T
              : IsAny<NonNullable<T>> extends true
              ? T
              : {
                  [key in keyof T]: AddRawGQL<T[key]> | RawGQL;
                };

            export type AddRawGQLToOptions<TProps> = TProps extends { where?: infer TWhere }
              ? {
                  where?: AddRawGQL<NonNullable<TWhere>>;
                } & AddRawGQLToOptions<Omit<TProps, \\"where\\">>
              : TProps extends { sort?: infer TSort }
              ? {
                  sort?: NonNullable<TSort> extends (infer TItem)[]
                    ? AddRawGQL<NonNullable<TItem>>[]
                    : never;
                }
              : {};

            export type ResolverArgs<
              TModel extends object,
              TKey extends keyof TModel,
              TResolvers extends { [key: PropertyKey]: Resolver<any, any, any, any> }
            > = TModel[TKey] extends Primitive
              ? never
              : NonNullable<TResolvers[TKey]> extends Resolver<any, any, any, infer Props>
              ? \\"directed\\" extends keyof Props
                ? Omit<Props, \\"directed\\" | \\"where\\" | \\"sort\\"> & {
                    directed?: boolean;
                  } & AddRawGQLToOptions<Props>
                : {}
              : {};

            export type UnionToIntersection<U> = (
              U extends any ? (k: U) => void : never
            ) extends (k: infer I) => void
              ? I
              : never;
            type LastOf<T> = UnionToIntersection<
              T extends any ? () => T : never
            > extends () => infer R
              ? R
              : never;

            type Push<T extends any[], V> = [...T, V];

            export type TuplifyUnion<
              T,
              L = LastOf<T>,
              N = [T] extends [never] ? true : false
            > = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>;

            // This is pure magic
            export type MagicArray<TArray extends any[]> =
              NonNullable<TArray> extends (infer TItem)[] ? TItem[] : never;
            export type MagicObject<TElement> =
              NonNullable<TElement> extends (infer TItem)[]
                ? TItem[]
                : NonNullable<TElement> extends Primitive
                ? TElement
                : {
                    [key in keyof TElement as TElement[key] extends never
                      ? never
                      : key]: MagicObject<TElement[key]>;
                  };

            export type StripNeverKeys<TElement> = TElement extends object
              ? {
                  [key in keyof TElement as [TElement[key]] extends [never]
                    ? never
                    : TElement[key] extends never[]
                    ? never
                    : key]: TElement[key];
                }
              : TElement;

            export type ClearObjectWithNeverKeys<
              TElement,
              TStripped = StripNeverKeys<TElement>
            > = [keyof Omit<TElement, keyof TStripped>] extends [never] ? TStripped : never;

            export type StripNeverKeysAddTypename<
              TElement,
              TKey,
              TStripped = ClearObjectWithNeverKeys<TElement>
            > = [keyof TStripped] extends [never]
              ? never
              : TStripped & { __typename: TKey };

            type RetrieveType<TItem> = Exclude<
              TItem,
              Promise<any>
            > extends ResolverTypeWrapper<infer TValue>
              ? TValue extends { __typename?: infer TName }
                ? TItem extends object
                  ? TName extends keyof Resolvers
                    ? \\"__isTypeOf\\" extends keyof RequiredResolvers[TName]
                      ? Omit<RequiredResolvers[TName], \\"__isTypeOf\\"> extends {
                          [key: string]: Resolver<any, any, any, any>;
                        }
                        ? {
                            Model: Exclude<TItem, Promise<any>>;
                            Resolvers: Omit<RequiredResolvers[TName], \\"__isTypeOf\\">;
                          }
                        : never
                      : never
                    : never
                  : never
                : never
              : never;

            export type ResolverReturnType<
              TModel extends object,
              TKey extends keyof TModel,
              TResolvers extends { [key: PropertyKey]: Resolver<any, any, any, any> }
            > = TModel[TKey] extends Primitive
              ? never
              : NonNullable<TResolvers[TKey]> extends Resolver<infer Props, any, any, any>
              ? Props extends (infer TItem)[]
                ? RetrieveType<Exclude<TItem, Promise<any>>>
                : RetrieveType<Exclude<Props, Promise<any>>>
              : never;

            export type ResolverObject = {
              [key: PropertyKey]: Resolver<any, any, any> | Resolver<any, any, any, any>;
            };

            export type ResolveKey<
              TModel extends object,
              TResolvers extends ResolverObject,
              TItem,
              TKey,
              TOmittedElement = TKey extends keyof TItem
                ? Omit<
                    NonNullable<TItem[TKey]>,
                    \\"where\\" | \\"directed\\" | \\"options\\" | \\"after\\" | \\"first\\" | \\"sort\\"
                  >
                : never
            > = TKey extends keyof TModel
              ? NonNullable<TModel[TKey]> extends Primitive
                ? TModel[TKey]
                : ResolverReturnType<TModel, TKey, TResolvers> extends {
                    Model: infer NestedTModel;
                    Resolvers: infer NestedResolvers;
                  }
                ? NestedTModel extends object
                  ? NestedResolvers extends ResolverObject
                    ? TKey extends keyof TItem
                      ? \\"on\\" extends keyof TOmittedElement
                        ?
                            | ({
                                -readonly [key in keyof TOmittedElement[\\"on\\"]]: StripNeverKeysAddTypename<
                                  {
                                    -readonly [K in keyof TOmittedElement[\\"on\\"][key]]: K extends keyof NestedTModel
                                      ? NestedTModel[K] extends any[]
                                        ? MagicArray<
                                            ResolveKey<
                                              NestedTModel,
                                              NestedResolvers,
                                              TOmittedElement[\\"on\\"][key],
                                              K
                                            >[]
                                          >
                                        : ResolveKey<
                                            NestedTModel,
                                            NestedResolvers,
                                            TOmittedElement[\\"on\\"][key],
                                            K
                                          >
                                      : never;
                                  },
                                  key
                                >;
                              }[keyof TOmittedElement[\\"on\\"]] &
                                ResolveKey<
                                  TModel,
                                  TResolvers,
                                  Omit<TItem, TKey> & {
                                    [key in TKey]: Omit<TOmittedElement, \\"on\\">;
                                  },
                                  TKey
                                >)
                            | (undefined extends TModel[TKey]
                                ? NonNullable<TModel[TKey]> extends any[]
                                  ? never
                                  : undefined
                                : never)
                            | (undefined extends TItem[TKey]
                                ? NonNullable<TModel[TKey]> extends any[]
                                  ? never
                                  : undefined
                                : never)
                        : ClearObjectWithNeverKeys<
                            | {
                                -readonly [key in keyof TOmittedElement as key extends keyof NestedTModel
                                  ? key
                                  : never]: key extends keyof NestedTModel
                                  ? NestedTModel[key] extends any[]
                                    ? MagicArray<
                                        ResolveKey<
                                          NestedTModel,
                                          NestedResolvers,
                                          TOmittedElement,
                                          key
                                        >[]
                                      >
                                    : ResolveKey<
                                        NestedTModel,
                                        NestedResolvers,
                                        TOmittedElement,
                                        key
                                      >
                                  : never;
                              }
                            | (undefined extends TModel[TKey]
                                ? NonNullable<TModel[TKey]> extends any[]
                                  ? never
                                  : undefined
                                : never)
                            | (undefined extends TItem[TKey]
                                ? NonNullable<TModel[TKey]> extends any[]
                                  ? never
                                  : undefined
                                : never)
                          >
                      : never
                    : never
                  : TModel[TKey] extends (infer TArrayItem)[]
                  ? NonNullable<TArrayItem> extends Primitive
                    ? TArrayItem
                    : never
                  : never
                : never
              : never;

            //Only if TValue = any, this is true
            export type IsAny<TValue> = unknown extends TValue ? true : false;

            export type NestedBooleanObject<
              TModel extends object,
              TResolvers extends ResolverObject,
              TKey extends keyof TModel,
              TElement,
              RequiredValue extends NonNullable<TElement> = NonNullable<TElement>
            > = IsAny<RequiredValue> extends true
              ? boolean
              : RequiredValue extends object
              ? RequiredValue extends (infer TItem)[]
                ? NonNullable<TItem> extends Primitive
                  ? boolean
                  : {
                      [key in keyof TItem]?: ResolverReturnType<
                        TModel,
                        TKey,
                        TResolvers
                      > extends {
                        Model: infer NestedModel;
                        Resolvers: infer NestedResolvers;
                      }
                        ? NestedModel extends object
                          ? NestedResolvers extends ResolverObject
                            ? key extends keyof NestedModel
                              ? NonNullable<TItem[key]> extends object
                                ? NonNullable<TItem[key]> extends any[]
                                  ? NestedBooleanObject<
                                      NestedModel,
                                      NestedResolvers,
                                      key,
                                      NonNullable<NonNullable<TItem>[key]>
                                    >
                                  : IsAny<NonNullable<TItem[key]>> extends true
                                  ? boolean
                                  : \\"__typename\\" extends keyof NonNullable<TItem[key]>
                                  ? NestedBooleanObject<
                                      NestedModel,
                                      NestedResolvers,
                                      key,
                                      UnionToIntersection<
                                        Omit<
                                          NonNullable<NonNullable<TItem>[key]>,
                                          \\"__typename\\"
                                        >
                                      > & {
                                        __typename: NonNullable<
                                          NonNullable<TItem[key]>[\\"__typename\\"]
                                        >;
                                      }
                                    >
                                  : never
                                : boolean
                              : never
                            : never
                          : never
                        : never;
                    } & ResolverArgs<TModel, TKey, TResolvers> &
                      BooleanOn<TElement>
                : {
                    [key in keyof RequiredValue]?: ResolverReturnType<
                      TModel,
                      TKey,
                      TResolvers
                    > extends { Model: infer NestedModel; Resolvers: infer NestedResolvers }
                      ? NestedModel extends object
                        ? NestedResolvers extends ResolverObject
                          ? key extends keyof NestedModel
                            ? NonNullable<RequiredValue[key]> extends any[]
                              ? NestedBooleanObject<
                                  NestedModel,
                                  NestedResolvers,
                                  key,
                                  NonNullable<RequiredValue[key]>
                                >
                              : NonNullable<RequiredValue[key]> extends object
                              ? IsAny<NonNullable<RequiredValue[key]>> extends true
                                ? boolean
                                : \\"__typename\\" extends keyof NonNullable<RequiredValue[key]>
                                ? NestedBooleanObject<
                                    NestedModel,
                                    NestedResolvers,
                                    key,
                                    UnionToIntersection<
                                      Omit<NonNullable<RequiredValue[key]>, \\"__typename\\">
                                    > & {
                                      __typename: NonNullable<
                                        NonNullable<RequiredValue[key]>[\\"__typename\\"]
                                      >;
                                    }
                                  >
                                : never
                              : boolean
                            : never
                          : never
                        : never
                      : never;
                  } & BooleanOn<TElement> &
                    ResolverArgs<TModel, TKey, TResolvers>
              : boolean;

            export type SelectionSetObject<
              TModel extends object,
              TResolvers extends ResolverObject
            > = {
              [key in keyof TModel]?: NonNullable<TModel[key]> extends Primitive
                ? boolean
                : NonNullable<TModel[key]> extends (infer TItem)[]
                ? \\"__typename\\" extends keyof TItem
                  ? NestedBooleanObject<
                      TModel,
                      TResolvers,
                      key,
                      Prettify<
                        UnionToIntersection<Omit<NonNullable<TItem>, \\"__typename\\">> & {
                          __typename: NonNullable<NonNullable<TItem>[\\"__typename\\"]>;
                        }
                      >
                    >
                  : NonNullable<TItem> extends Primitive
                  ? boolean
                  : never
                : \\"__typename\\" extends keyof NonNullable<TModel[key]>
                ? NestedBooleanObject<
                    TModel,
                    TResolvers,
                    key,
                    Prettify<
                      UnionToIntersection<Omit<NonNullable<TModel[key]>, \\"__typename\\">> & {
                        __typename: NonNullable<NonNullable<TModel[key]>[\\"__typename\\"]>;
                      }
                    >
                  >
                : never;
            };

            type BooleanOn<TElement> = TElement extends { __typename: infer Typename }
              ? TuplifyUnion<NonNullable<Typename>>[\\"length\\"] extends 1
                ? {}
                : NonNullable<Typename> extends string
                ? {
                    on?: {
                      [key in NonNullable<Typename>]?: key extends keyof RequiredResolvers
                        ? key extends keyof ResolversTypes
                          ? Omit<
                              RequiredResolvers[key],
                              \\"__isTypeOf\\"
                            > extends ResolverObject
                            ? {
                                [K in keyof NonNullable<
                                  Exclude<ResolversTypes[key], Promise<any>>
                                >]?: NestedBooleanObject<
                                  NonNullable<Exclude<ResolversTypes[key], Promise<any>>>,
                                  Omit<RequiredResolvers[key], \\"__isTypeOf\\">,
                                  K,
                                  NonNullable<Exclude<ResolversTypes[key], Promise<any>>>[K]
                                >;
                              }
                            : never
                          : never
                        : never;
                    };
                  }
                : never
              : {};

            export type InferFromSelectionSetObject<
              TModel extends object,
              TResolvers extends ResolverObject,
              TSelectionSet extends SelectionSetObject<TModel, TResolvers>
            > = MagicObject<{
              -readonly [key in keyof TSelectionSet]: key extends keyof TModel
                ? NonNullable<TModel[key]> extends any[]
                  ?
                      | ResolveKey<TModel, TResolvers, TSelectionSet, key>[]
                      | (undefined extends TModel[key] ? undefined : never)
                  :
                      | ResolveKey<TModel, TResolvers, TSelectionSet, key>
                      | (undefined extends TModel[key] ? undefined : never)
                : never;
            }>;
            import { GraphQLResolveInfo } from \\"graphql\\";
            export type Maybe<T> = T | null;
            export type InputMaybe<T> = Maybe<T>;
            export type Exact<T extends { [key: string]: unknown }> = {
              [K in keyof T]: T[K];
            };
            export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
              [SubKey in K]?: Maybe<T[SubKey]>;
            };
            export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
              [SubKey in K]: Maybe<T[SubKey]>;
            };
            export type MakeEmpty<
              T extends { [key: string]: unknown },
              K extends keyof T
            > = { [_ in K]?: never };
            export type Incremental<T> =
              | T
              | {
                  [P in keyof T]?: P extends \\" $fragmentName\\" | \\"__typename\\" ? T[P] : never;
                };
            export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
              [P in K]-?: NonNullable<T[P]>;
            };
            /** All built-in and custom scalars, mapped to their actual values */
            export type Scalars = {
              /** The \`ID\` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as \`\\"4\\"\`) or integer (such as \`4\`) input value will be accepted as an ID. */
              ID: { input: string; output: string };
              /** The \`String\` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text. */
              String: { input: string; output: string };
              /** The \`Boolean\` scalar type represents \`true\` or \`false\`. */
              Boolean: { input: boolean; output: boolean };
              /** The \`Int\` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. */
              Int: { input: number; output: number };
              /** The \`Float\` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point). */
              Float: { input: number; output: number };
            };

            export type Query = {
              __typename?: \\"Query\\";
              faqs: Array<Faq>;
              faqsConnection: FaqsConnection;
              faqsAggregate: FaqAggregateSelection;
              faqEntries: Array<FaqEntry>;
              faqEntriesConnection: FaqEntriesConnection;
              faqEntriesAggregate: FaqEntryAggregateSelection;
            };

            export type QueryFaqsArgs = {
              where?: InputMaybe<FaqWhere>;
              options?: InputMaybe<FaqOptions>;
            };

            export type QueryFaqsConnectionArgs = {
              first?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              after?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              where?: InputMaybe<FaqWhere>;
              sort?: InputMaybe<Array<InputMaybe<FaqSort>>>;
            };

            export type QueryFaqsAggregateArgs = {
              where?: InputMaybe<FaqWhere>;
            };

            export type QueryFaqEntriesArgs = {
              where?: InputMaybe<FaqEntryWhere>;
              options?: InputMaybe<FaqEntryOptions>;
            };

            export type QueryFaqEntriesConnectionArgs = {
              first?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              after?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              where?: InputMaybe<FaqEntryWhere>;
              sort?: InputMaybe<Array<InputMaybe<FaqEntrySort>>>;
            };

            export type QueryFaqEntriesAggregateArgs = {
              where?: InputMaybe<FaqEntryWhere>;
            };

            export type Mutation = {
              __typename?: \\"Mutation\\";
              createFaqs: CreateFaqsMutationResponse;
              deleteFaqs: DeleteInfo;
              updateFaqs: UpdateFaqsMutationResponse;
              createFaqEntries: CreateFaqEntriesMutationResponse;
              deleteFaqEntries: DeleteInfo;
              updateFaqEntries: UpdateFaqEntriesMutationResponse;
            };

            export type MutationCreateFaqsArgs = {
              input: Array<FaqCreateInput>;
            };

            export type MutationDeleteFaqsArgs = {
              where?: InputMaybe<FaqWhere>;
              delete?: InputMaybe<FaqDeleteInput>;
            };

            export type MutationUpdateFaqsArgs = {
              where?: InputMaybe<FaqWhere>;
              update?: InputMaybe<FaqUpdateInput>;
              connect?: InputMaybe<FaqConnectInput>;
              disconnect?: InputMaybe<FaqDisconnectInput>;
              create?: InputMaybe<FaqRelationInput>;
              delete?: InputMaybe<FaqDeleteInput>;
              connectOrCreate?: InputMaybe<FaqConnectOrCreateInput>;
            };

            export type MutationCreateFaqEntriesArgs = {
              input: Array<FaqEntryCreateInput>;
            };

            export type MutationDeleteFaqEntriesArgs = {
              where?: InputMaybe<FaqEntryWhere>;
              delete?: InputMaybe<FaqEntryDeleteInput>;
            };

            export type MutationUpdateFaqEntriesArgs = {
              where?: InputMaybe<FaqEntryWhere>;
              update?: InputMaybe<FaqEntryUpdateInput>;
              connect?: InputMaybe<FaqEntryConnectInput>;
              disconnect?: InputMaybe<FaqEntryDisconnectInput>;
              create?: InputMaybe<FaqEntryRelationInput>;
              delete?: InputMaybe<FaqEntryDeleteInput>;
              connectOrCreate?: InputMaybe<FaqEntryConnectOrCreateInput>;
            };

            /** An enum for sorting in either ascending or descending order. */
            export enum SortDirection {
              /** Sort by field values in ascending order. */
              Asc = \\"ASC\\",
              /** Sort by field values in descending order. */
              Desc = \\"DESC\\",
            }

            export type CreateFaqEntriesMutationResponse = {
              __typename?: \\"CreateFaqEntriesMutationResponse\\";
              info: CreateInfo;
              faqEntries: Array<FaqEntry>;
            };

            export type CreateFaqsMutationResponse = {
              __typename?: \\"CreateFaqsMutationResponse\\";
              info: CreateInfo;
              faqs: Array<Faq>;
            };

            /** Information about the number of nodes and relationships created during a create mutation */
            export type CreateInfo = {
              __typename?: \\"CreateInfo\\";
              /** @deprecated This field has been deprecated because bookmarks are now handled by the driver. */
              bookmark?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              nodesCreated: Scalars[\\"Int\\"][\\"output\\"];
              relationshipsCreated: Scalars[\\"Int\\"][\\"output\\"];
            };

            /** Information about the number of nodes and relationships deleted during a delete mutation */
            export type DeleteInfo = {
              __typename?: \\"DeleteInfo\\";
              /** @deprecated This field has been deprecated because bookmarks are now handled by the driver. */
              bookmark?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              nodesDeleted: Scalars[\\"Int\\"][\\"output\\"];
              relationshipsDeleted: Scalars[\\"Int\\"][\\"output\\"];
            };

            export type Faq = {
              __typename?: \\"FAQ\\";
              id: Scalars[\\"ID\\"][\\"output\\"];
              activated: Scalars[\\"Boolean\\"][\\"output\\"];
              name: Scalars[\\"String\\"][\\"output\\"];
              entriesAggregate?: Maybe<FaqfaqEntryEntriesAggregationSelection>;
              entries: Array<FaqEntry>;
              entriesConnection: FaqEntriesConnection;
            };

            export type FaqEntriesAggregateArgs = {
              where?: InputMaybe<FaqEntryWhere>;
              directed?: InputMaybe<Scalars[\\"Boolean\\"][\\"input\\"]>;
            };

            export type FaqEntriesArgs = {
              where?: InputMaybe<FaqEntryWhere>;
              options?: InputMaybe<FaqEntryOptions>;
              directed?: InputMaybe<Scalars[\\"Boolean\\"][\\"input\\"]>;
            };

            export type FaqEntriesConnectionArgs = {
              where?: InputMaybe<FaqEntriesConnectionWhere>;
              first?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              after?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              directed?: InputMaybe<Scalars[\\"Boolean\\"][\\"input\\"]>;
              sort?: InputMaybe<Array<FaqEntriesConnectionSort>>;
            };

            export type FaqAggregateSelection = {
              __typename?: \\"FAQAggregateSelection\\";
              count: Scalars[\\"Int\\"][\\"output\\"];
              id: IdAggregateSelection;
              name: StringAggregateSelection;
            };

            export type FaqEdge = {
              __typename?: \\"FAQEdge\\";
              cursor: Scalars[\\"String\\"][\\"output\\"];
              node: Faq;
            };

            export type FaqEntriesConnection = {
              __typename?: \\"FaqEntriesConnection\\";
              totalCount: Scalars[\\"Int\\"][\\"output\\"];
              pageInfo: PageInfo;
              edges: Array<FaqEntryEdge>;
            };

            export type FaqEntriesConnection = {
              __typename?: \\"FAQEntriesConnection\\";
              edges: Array<FaqEntriesRelationship>;
              totalCount: Scalars[\\"Int\\"][\\"output\\"];
              pageInfo: PageInfo;
            };

            export type FaqEntriesRelationship = {
              __typename?: \\"FAQEntriesRelationship\\";
              cursor: Scalars[\\"String\\"][\\"output\\"];
              node: FaqEntry;
              properties: FaqEntryInFaq;
            };

            export type FaqEntry = {
              __typename?: \\"FAQEntry\\";
              id: Scalars[\\"ID\\"][\\"output\\"];
              title: Scalars[\\"String\\"][\\"output\\"];
              body: Scalars[\\"String\\"][\\"output\\"];
              inFAQsAggregate?: Maybe<FaqEntryFaqInFaQsAggregationSelection>;
              inFAQs: Array<Faq>;
              inFAQsConnection: FaqEntryInFaQsConnection;
            };

            export type FaqEntryInFaQsAggregateArgs = {
              where?: InputMaybe<FaqWhere>;
              directed?: InputMaybe<Scalars[\\"Boolean\\"][\\"input\\"]>;
            };

            export type FaqEntryInFaQsArgs = {
              where?: InputMaybe<FaqWhere>;
              options?: InputMaybe<FaqOptions>;
              directed?: InputMaybe<Scalars[\\"Boolean\\"][\\"input\\"]>;
            };

            export type FaqEntryInFaQsConnectionArgs = {
              where?: InputMaybe<FaqEntryInFaQsConnectionWhere>;
              first?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              after?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              directed?: InputMaybe<Scalars[\\"Boolean\\"][\\"input\\"]>;
              sort?: InputMaybe<Array<FaqEntryInFaQsConnectionSort>>;
            };

            export type FaqEntryAggregateSelection = {
              __typename?: \\"FAQEntryAggregateSelection\\";
              count: Scalars[\\"Int\\"][\\"output\\"];
              id: IdAggregateSelection;
              title: StringAggregateSelection;
              body: StringAggregateSelection;
            };

            export type FaqEntryEdge = {
              __typename?: \\"FAQEntryEdge\\";
              cursor: Scalars[\\"String\\"][\\"output\\"];
              node: FaqEntry;
            };

            export type FaqEntryFaqInFaQsAggregationSelection = {
              __typename?: \\"FAQEntryFAQInFAQsAggregationSelection\\";
              count: Scalars[\\"Int\\"][\\"output\\"];
              node?: Maybe<FaqEntryFaqInFaQsNodeAggregateSelection>;
              edge?: Maybe<FaqEntryFaqInFaQsEdgeAggregateSelection>;
            };

            export type FaqEntryFaqInFaQsEdgeAggregateSelection = {
              __typename?: \\"FAQEntryFAQInFAQsEdgeAggregateSelection\\";
              position: IntAggregateSelection;
            };

            export type FaqEntryFaqInFaQsNodeAggregateSelection = {
              __typename?: \\"FAQEntryFAQInFAQsNodeAggregateSelection\\";
              id: IdAggregateSelection;
              name: StringAggregateSelection;
            };

            /**
             * The edge properties for the following fields:
             * * FAQ.entries
             * * FAQEntry.inFAQs
             */
            export type FaqEntryInFaq = {
              __typename?: \\"FaqEntryInFaq\\";
              position?: Maybe<Scalars[\\"Int\\"][\\"output\\"]>;
            };

            export type FaqEntryInFaQsConnection = {
              __typename?: \\"FAQEntryInFAQsConnection\\";
              edges: Array<FaqEntryInFaQsRelationship>;
              totalCount: Scalars[\\"Int\\"][\\"output\\"];
              pageInfo: PageInfo;
            };

            export type FaqEntryInFaQsRelationship = {
              __typename?: \\"FAQEntryInFAQsRelationship\\";
              cursor: Scalars[\\"String\\"][\\"output\\"];
              node: Faq;
              properties: FaqEntryInFaq;
            };

            export type FaqfaqEntryEntriesAggregationSelection = {
              __typename?: \\"FAQFAQEntryEntriesAggregationSelection\\";
              count: Scalars[\\"Int\\"][\\"output\\"];
              node?: Maybe<FaqfaqEntryEntriesNodeAggregateSelection>;
              edge?: Maybe<FaqfaqEntryEntriesEdgeAggregateSelection>;
            };

            export type FaqfaqEntryEntriesEdgeAggregateSelection = {
              __typename?: \\"FAQFAQEntryEntriesEdgeAggregateSelection\\";
              position: IntAggregateSelection;
            };

            export type FaqfaqEntryEntriesNodeAggregateSelection = {
              __typename?: \\"FAQFAQEntryEntriesNodeAggregateSelection\\";
              id: IdAggregateSelection;
              title: StringAggregateSelection;
              body: StringAggregateSelection;
            };

            export type FaqsConnection = {
              __typename?: \\"FaqsConnection\\";
              totalCount: Scalars[\\"Int\\"][\\"output\\"];
              pageInfo: PageInfo;
              edges: Array<FaqEdge>;
            };

            export type IdAggregateSelection = {
              __typename?: \\"IDAggregateSelection\\";
              shortest?: Maybe<Scalars[\\"ID\\"][\\"output\\"]>;
              longest?: Maybe<Scalars[\\"ID\\"][\\"output\\"]>;
            };

            export type IntAggregateSelection = {
              __typename?: \\"IntAggregateSelection\\";
              max?: Maybe<Scalars[\\"Int\\"][\\"output\\"]>;
              min?: Maybe<Scalars[\\"Int\\"][\\"output\\"]>;
              average?: Maybe<Scalars[\\"Float\\"][\\"output\\"]>;
              sum?: Maybe<Scalars[\\"Int\\"][\\"output\\"]>;
            };

            /** Pagination information (Relay) */
            export type PageInfo = {
              __typename?: \\"PageInfo\\";
              hasNextPage: Scalars[\\"Boolean\\"][\\"output\\"];
              hasPreviousPage: Scalars[\\"Boolean\\"][\\"output\\"];
              startCursor?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              endCursor?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
            };

            export type StringAggregateSelection = {
              __typename?: \\"StringAggregateSelection\\";
              shortest?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              longest?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
            };

            export type UpdateFaqEntriesMutationResponse = {
              __typename?: \\"UpdateFaqEntriesMutationResponse\\";
              info: UpdateInfo;
              faqEntries: Array<FaqEntry>;
            };

            export type UpdateFaqsMutationResponse = {
              __typename?: \\"UpdateFaqsMutationResponse\\";
              info: UpdateInfo;
              faqs: Array<Faq>;
            };

            /** Information about the number of nodes and relationships created and deleted during an update mutation */
            export type UpdateInfo = {
              __typename?: \\"UpdateInfo\\";
              /** @deprecated This field has been deprecated because bookmarks are now handled by the driver. */
              bookmark?: Maybe<Scalars[\\"String\\"][\\"output\\"]>;
              nodesCreated: Scalars[\\"Int\\"][\\"output\\"];
              nodesDeleted: Scalars[\\"Int\\"][\\"output\\"];
              relationshipsCreated: Scalars[\\"Int\\"][\\"output\\"];
              relationshipsDeleted: Scalars[\\"Int\\"][\\"output\\"];
            };

            export type FaqConnectInput = {
              entries?: InputMaybe<Array<FaqEntriesConnectFieldInput>>;
            };

            export type FaqConnectOrCreateInput = {
              entries?: InputMaybe<Array<FaqEntriesConnectOrCreateFieldInput>>;
            };

            export type FaqConnectOrCreateWhere = {
              node: FaqUniqueWhere;
            };

            export type FaqConnectWhere = {
              node: FaqWhere;
            };

            export type FaqCreateInput = {
              activated: Scalars[\\"Boolean\\"][\\"input\\"];
              name: Scalars[\\"String\\"][\\"input\\"];
              entries?: InputMaybe<FaqEntriesFieldInput>;
            };

            export type FaqDeleteInput = {
              entries?: InputMaybe<Array<FaqEntriesDeleteFieldInput>>;
            };

            export type FaqDisconnectInput = {
              entries?: InputMaybe<Array<FaqEntriesDisconnectFieldInput>>;
            };

            export type FaqEntriesAggregateInput = {
              count?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              count_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              count_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              count_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              count_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              AND?: InputMaybe<Array<FaqEntriesAggregateInput>>;
              OR?: InputMaybe<Array<FaqEntriesAggregateInput>>;
              NOT?: InputMaybe<FaqEntriesAggregateInput>;
              node?: InputMaybe<FaqEntriesNodeAggregationWhereInput>;
              edge?: InputMaybe<FaqEntryInFaqAggregationWhereInput>;
            };

            export type FaqEntriesConnectFieldInput = {
              edge?: InputMaybe<FaqEntryInFaqCreateInput>;
              where?: InputMaybe<FaqEntryConnectWhere>;
              /** Whether or not to overwrite any matching relationship with the new properties. */
              overwrite?: Scalars[\\"Boolean\\"][\\"input\\"];
              connect?: InputMaybe<Array<FaqEntryConnectInput>>;
            };

            export type FaqEntriesConnectionSort = {
              node?: InputMaybe<FaqEntrySort>;
              edge?: InputMaybe<FaqEntryInFaqSort>;
            };

            export type FaqEntriesConnectionWhere = {
              AND?: InputMaybe<Array<FaqEntriesConnectionWhere>>;
              OR?: InputMaybe<Array<FaqEntriesConnectionWhere>>;
              NOT?: InputMaybe<FaqEntriesConnectionWhere>;
              node?: InputMaybe<FaqEntryWhere>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              node_NOT?: InputMaybe<FaqEntryWhere>;
              edge?: InputMaybe<FaqEntryInFaqWhere>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              edge_NOT?: InputMaybe<FaqEntryInFaqWhere>;
            };

            export type FaqEntriesConnectOrCreateFieldInput = {
              where: FaqEntryConnectOrCreateWhere;
              onCreate: FaqEntriesConnectOrCreateFieldInputOnCreate;
            };

            export type FaqEntriesConnectOrCreateFieldInputOnCreate = {
              node: FaqEntryOnCreateInput;
              edge?: InputMaybe<FaqEntryInFaqCreateInput>;
            };

            export type FaqEntriesCreateFieldInput = {
              edge?: InputMaybe<FaqEntryInFaqCreateInput>;
              node: FaqEntryCreateInput;
            };

            export type FaqEntriesDeleteFieldInput = {
              where?: InputMaybe<FaqEntriesConnectionWhere>;
              delete?: InputMaybe<FaqEntryDeleteInput>;
            };

            export type FaqEntriesDisconnectFieldInput = {
              where?: InputMaybe<FaqEntriesConnectionWhere>;
              disconnect?: InputMaybe<FaqEntryDisconnectInput>;
            };

            export type FaqEntriesFieldInput = {
              connectOrCreate?: InputMaybe<Array<FaqEntriesConnectOrCreateFieldInput>>;
              connect?: InputMaybe<Array<FaqEntriesConnectFieldInput>>;
              create?: InputMaybe<Array<FaqEntriesCreateFieldInput>>;
            };

            export type FaqEntriesNodeAggregationWhereInput = {
              AND?: InputMaybe<Array<FaqEntriesNodeAggregationWhereInput>>;
              OR?: InputMaybe<Array<FaqEntriesNodeAggregationWhereInput>>;
              NOT?: InputMaybe<FaqEntriesNodeAggregationWhereInput>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              id_EQUAL?: InputMaybe<Scalars[\\"ID\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              title_EQUAL?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              title_AVERAGE_EQUAL?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              title_LONGEST_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              title_SHORTEST_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              title_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              title_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              title_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              title_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              title_AVERAGE_GT?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              title_LONGEST_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              title_SHORTEST_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              title_AVERAGE_LENGTH_GT?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              title_LONGEST_LENGTH_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              title_SHORTEST_LENGTH_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              title_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              title_AVERAGE_GTE?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              title_LONGEST_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              title_SHORTEST_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              title_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              title_LONGEST_LENGTH_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              title_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              title_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              title_AVERAGE_LT?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              title_LONGEST_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              title_SHORTEST_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              title_AVERAGE_LENGTH_LT?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              title_LONGEST_LENGTH_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              title_SHORTEST_LENGTH_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              title_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              title_AVERAGE_LTE?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              title_LONGEST_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              title_SHORTEST_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              title_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              title_LONGEST_LENGTH_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              title_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              body_EQUAL?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              body_AVERAGE_EQUAL?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              body_LONGEST_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              body_SHORTEST_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              body_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              body_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              body_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              body_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              body_AVERAGE_GT?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              body_LONGEST_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              body_SHORTEST_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              body_AVERAGE_LENGTH_GT?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              body_LONGEST_LENGTH_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              body_SHORTEST_LENGTH_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              body_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              body_AVERAGE_GTE?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              body_LONGEST_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              body_SHORTEST_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              body_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              body_LONGEST_LENGTH_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              body_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              body_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              body_AVERAGE_LT?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              body_LONGEST_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              body_SHORTEST_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              body_AVERAGE_LENGTH_LT?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              body_LONGEST_LENGTH_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              body_SHORTEST_LENGTH_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              body_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              body_AVERAGE_LTE?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              body_LONGEST_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              body_SHORTEST_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              body_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              body_LONGEST_LENGTH_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              body_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
            };

            export type FaqEntriesUpdateConnectionInput = {
              node?: InputMaybe<FaqEntryUpdateInput>;
              edge?: InputMaybe<FaqEntryInFaqUpdateInput>;
            };

            export type FaqEntriesUpdateFieldInput = {
              where?: InputMaybe<FaqEntriesConnectionWhere>;
              connectOrCreate?: InputMaybe<Array<FaqEntriesConnectOrCreateFieldInput>>;
              connect?: InputMaybe<Array<FaqEntriesConnectFieldInput>>;
              disconnect?: InputMaybe<Array<FaqEntriesDisconnectFieldInput>>;
              create?: InputMaybe<Array<FaqEntriesCreateFieldInput>>;
              update?: InputMaybe<FaqEntriesUpdateConnectionInput>;
              delete?: InputMaybe<Array<FaqEntriesDeleteFieldInput>>;
            };

            export type FaqEntryConnectInput = {
              inFAQs?: InputMaybe<Array<FaqEntryInFaQsConnectFieldInput>>;
            };

            export type FaqEntryConnectOrCreateInput = {
              inFAQs?: InputMaybe<Array<FaqEntryInFaQsConnectOrCreateFieldInput>>;
            };

            export type FaqEntryConnectOrCreateWhere = {
              node: FaqEntryUniqueWhere;
            };

            export type FaqEntryConnectWhere = {
              node: FaqEntryWhere;
            };

            export type FaqEntryCreateInput = {
              title: Scalars[\\"String\\"][\\"input\\"];
              body: Scalars[\\"String\\"][\\"input\\"];
              inFAQs?: InputMaybe<FaqEntryInFaQsFieldInput>;
            };

            export type FaqEntryDeleteInput = {
              inFAQs?: InputMaybe<Array<FaqEntryInFaQsDeleteFieldInput>>;
            };

            export type FaqEntryDisconnectInput = {
              inFAQs?: InputMaybe<Array<FaqEntryInFaQsDisconnectFieldInput>>;
            };

            export type FaqEntryInFaqAggregationWhereInput = {
              AND?: InputMaybe<Array<FaqEntryInFaqAggregationWhereInput>>;
              OR?: InputMaybe<Array<FaqEntryInFaqAggregationWhereInput>>;
              NOT?: InputMaybe<FaqEntryInFaqAggregationWhereInput>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              position_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_MIN_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_MAX_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_SUM_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_AVERAGE_EQUAL?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              position_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_MIN_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_MAX_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_SUM_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_AVERAGE_GT?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              position_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_MIN_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_MAX_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_SUM_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_AVERAGE_GTE?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              position_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_MIN_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_MAX_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_SUM_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_AVERAGE_LT?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              position_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_MIN_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_MAX_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_SUM_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_AVERAGE_LTE?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
            };

            export type FaqEntryInFaqCreateInput = {
              position?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
            };

            export type FaqEntryInFaQsAggregateInput = {
              count?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              count_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              count_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              count_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              count_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              AND?: InputMaybe<Array<FaqEntryInFaQsAggregateInput>>;
              OR?: InputMaybe<Array<FaqEntryInFaQsAggregateInput>>;
              NOT?: InputMaybe<FaqEntryInFaQsAggregateInput>;
              node?: InputMaybe<FaqEntryInFaQsNodeAggregationWhereInput>;
              edge?: InputMaybe<FaqEntryInFaqAggregationWhereInput>;
            };

            export type FaqEntryInFaQsConnectFieldInput = {
              edge?: InputMaybe<FaqEntryInFaqCreateInput>;
              where?: InputMaybe<FaqConnectWhere>;
              /** Whether or not to overwrite any matching relationship with the new properties. */
              overwrite?: Scalars[\\"Boolean\\"][\\"input\\"];
              connect?: InputMaybe<Array<FaqConnectInput>>;
            };

            export type FaqEntryInFaQsConnectionSort = {
              node?: InputMaybe<FaqSort>;
              edge?: InputMaybe<FaqEntryInFaqSort>;
            };

            export type FaqEntryInFaQsConnectionWhere = {
              AND?: InputMaybe<Array<FaqEntryInFaQsConnectionWhere>>;
              OR?: InputMaybe<Array<FaqEntryInFaQsConnectionWhere>>;
              NOT?: InputMaybe<FaqEntryInFaQsConnectionWhere>;
              node?: InputMaybe<FaqWhere>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              node_NOT?: InputMaybe<FaqWhere>;
              edge?: InputMaybe<FaqEntryInFaqWhere>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              edge_NOT?: InputMaybe<FaqEntryInFaqWhere>;
            };

            export type FaqEntryInFaQsConnectOrCreateFieldInput = {
              where: FaqConnectOrCreateWhere;
              onCreate: FaqEntryInFaQsConnectOrCreateFieldInputOnCreate;
            };

            export type FaqEntryInFaQsConnectOrCreateFieldInputOnCreate = {
              node: FaqOnCreateInput;
              edge?: InputMaybe<FaqEntryInFaqCreateInput>;
            };

            export type FaqEntryInFaQsCreateFieldInput = {
              edge?: InputMaybe<FaqEntryInFaqCreateInput>;
              node: FaqCreateInput;
            };

            export type FaqEntryInFaQsDeleteFieldInput = {
              where?: InputMaybe<FaqEntryInFaQsConnectionWhere>;
              delete?: InputMaybe<FaqDeleteInput>;
            };

            export type FaqEntryInFaQsDisconnectFieldInput = {
              where?: InputMaybe<FaqEntryInFaQsConnectionWhere>;
              disconnect?: InputMaybe<FaqDisconnectInput>;
            };

            export type FaqEntryInFaQsFieldInput = {
              connectOrCreate?: InputMaybe<Array<FaqEntryInFaQsConnectOrCreateFieldInput>>;
              connect?: InputMaybe<Array<FaqEntryInFaQsConnectFieldInput>>;
              create?: InputMaybe<Array<FaqEntryInFaQsCreateFieldInput>>;
            };

            export type FaqEntryInFaQsNodeAggregationWhereInput = {
              AND?: InputMaybe<Array<FaqEntryInFaQsNodeAggregationWhereInput>>;
              OR?: InputMaybe<Array<FaqEntryInFaQsNodeAggregationWhereInput>>;
              NOT?: InputMaybe<FaqEntryInFaQsNodeAggregationWhereInput>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              id_EQUAL?: InputMaybe<Scalars[\\"ID\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              name_EQUAL?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_AVERAGE_EQUAL?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_LONGEST_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_SHORTEST_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              name_AVERAGE_LENGTH_EQUAL?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              name_LONGEST_LENGTH_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              name_SHORTEST_LENGTH_EQUAL?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              name_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_AVERAGE_GT?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_LONGEST_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_SHORTEST_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              name_AVERAGE_LENGTH_GT?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              name_LONGEST_LENGTH_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              name_SHORTEST_LENGTH_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              name_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_AVERAGE_GTE?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_LONGEST_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_SHORTEST_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              name_AVERAGE_LENGTH_GTE?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              name_LONGEST_LENGTH_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              name_SHORTEST_LENGTH_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              name_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_AVERAGE_LT?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_LONGEST_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_SHORTEST_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              name_AVERAGE_LENGTH_LT?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              name_LONGEST_LENGTH_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              name_SHORTEST_LENGTH_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Aggregation filters that are not relying on an aggregating function will be deprecated. */
              name_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_AVERAGE_LTE?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_LONGEST_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Please use the explicit _LENGTH version for string aggregation. */
              name_SHORTEST_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              name_AVERAGE_LENGTH_LTE?: InputMaybe<Scalars[\\"Float\\"][\\"input\\"]>;
              name_LONGEST_LENGTH_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              name_SHORTEST_LENGTH_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
            };

            export type FaqEntryInFaqSort = {
              position?: InputMaybe<SortDirection>;
            };

            export type FaqEntryInFaQsUpdateConnectionInput = {
              node?: InputMaybe<FaqUpdateInput>;
              edge?: InputMaybe<FaqEntryInFaqUpdateInput>;
            };

            export type FaqEntryInFaQsUpdateFieldInput = {
              where?: InputMaybe<FaqEntryInFaQsConnectionWhere>;
              connectOrCreate?: InputMaybe<Array<FaqEntryInFaQsConnectOrCreateFieldInput>>;
              connect?: InputMaybe<Array<FaqEntryInFaQsConnectFieldInput>>;
              disconnect?: InputMaybe<Array<FaqEntryInFaQsDisconnectFieldInput>>;
              create?: InputMaybe<Array<FaqEntryInFaQsCreateFieldInput>>;
              update?: InputMaybe<FaqEntryInFaQsUpdateConnectionInput>;
              delete?: InputMaybe<Array<FaqEntryInFaQsDeleteFieldInput>>;
            };

            export type FaqEntryInFaqUpdateInput = {
              position?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_INCREMENT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_DECREMENT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
            };

            export type FaqEntryInFaqWhere = {
              position?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              position_NOT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_IN?: InputMaybe<Array<InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>>>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              position_NOT_IN?: InputMaybe<Array<InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>>>;
              position_LT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_LTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_GT?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              position_GTE?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              OR?: InputMaybe<Array<FaqEntryInFaqWhere>>;
              AND?: InputMaybe<Array<FaqEntryInFaqWhere>>;
              NOT?: InputMaybe<FaqEntryInFaqWhere>;
            };

            export type FaqEntryOnCreateInput = {
              title: Scalars[\\"String\\"][\\"input\\"];
              body: Scalars[\\"String\\"][\\"input\\"];
            };

            export type FaqEntryOptions = {
              limit?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              offset?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** Specify one or more FAQEntrySort objects to sort FaqEntries by. The sorts will be applied in the order in which they are arranged in the array. */
              sort?: InputMaybe<Array<FaqEntrySort>>;
            };

            export type FaqEntryRelationInput = {
              inFAQs?: InputMaybe<Array<FaqEntryInFaQsCreateFieldInput>>;
            };

            /** Fields to sort FaqEntries by. The order in which sorts are applied is not guaranteed when specifying many fields in one FAQEntrySort object. */
            export type FaqEntrySort = {
              id?: InputMaybe<SortDirection>;
              title?: InputMaybe<SortDirection>;
              body?: InputMaybe<SortDirection>;
            };

            export type FaqEntryUniqueWhere = {
              id?: InputMaybe<Scalars[\\"ID\\"][\\"input\\"]>;
            };

            export type FaqEntryUpdateInput = {
              title?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              body?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              inFAQs?: InputMaybe<Array<FaqEntryInFaQsUpdateFieldInput>>;
            };

            export type FaqEntryWhere = {
              id?: InputMaybe<Scalars[\\"ID\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              id_NOT?: InputMaybe<Scalars[\\"ID\\"][\\"input\\"]>;
              id_IN?: InputMaybe<Array<Scalars[\\"ID\\"][\\"input\\"]>>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              id_NOT_IN?: InputMaybe<Array<Scalars[\\"ID\\"][\\"input\\"]>>;
              id_CONTAINS?: InputMaybe<Scalars[\\"ID\\"][\\"input\\"]>;
              id_STARTS_WITH?: InputMaybe<Scalars[\\"ID\\"][\\"input\\"]>;
              id_ENDS_WITH?: InputMaybe<Scalars[\\"ID\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              id_NOT_CONTAINS?: InputMaybe<Scalars[\\"ID\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              id_NOT_STARTS_WITH?: InputMaybe<Scalars[\\"ID\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              id_NOT_ENDS_WITH?: InputMaybe<Scalars[\\"ID\\"][\\"input\\"]>;
              title?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              title_NOT?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              title_IN?: InputMaybe<Array<Scalars[\\"String\\"][\\"input\\"]>>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              title_NOT_IN?: InputMaybe<Array<Scalars[\\"String\\"][\\"input\\"]>>;
              title_CONTAINS?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              title_STARTS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              title_ENDS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              title_NOT_CONTAINS?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              title_NOT_STARTS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              title_NOT_ENDS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              body?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              body_NOT?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              body_IN?: InputMaybe<Array<Scalars[\\"String\\"][\\"input\\"]>>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              body_NOT_IN?: InputMaybe<Array<Scalars[\\"String\\"][\\"input\\"]>>;
              body_CONTAINS?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              body_STARTS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              body_ENDS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              body_NOT_CONTAINS?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              body_NOT_STARTS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              body_NOT_ENDS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              OR?: InputMaybe<Array<FaqEntryWhere>>;
              AND?: InputMaybe<Array<FaqEntryWhere>>;
              NOT?: InputMaybe<FaqEntryWhere>;
              /** @deprecated Use \`inFAQs_SOME\` instead. */
              inFAQs?: InputMaybe<FaqWhere>;
              /** @deprecated Use \`inFAQs_NONE\` instead. */
              inFAQs_NOT?: InputMaybe<FaqWhere>;
              /** Return FAQEntries where all of the related FAQS match this filter */
              inFAQs_ALL?: InputMaybe<FaqWhere>;
              /** Return FAQEntries where none of the related FAQS match this filter */
              inFAQs_NONE?: InputMaybe<FaqWhere>;
              /** Return FAQEntries where one of the related FAQS match this filter */
              inFAQs_SINGLE?: InputMaybe<FaqWhere>;
              /** Return FAQEntries where some of the related FAQS match this filter */
              inFAQs_SOME?: InputMaybe<FaqWhere>;
              /** @deprecated Use \`inFAQsConnection_SOME\` instead. */
              inFAQsConnection?: InputMaybe<FaqEntryInFaQsConnectionWhere>;
              /** @deprecated Use \`inFAQsConnection_NONE\` instead. */
              inFAQsConnection_NOT?: InputMaybe<FaqEntryInFaQsConnectionWhere>;
              /** Return FAQEntries where all of the related FAQEntryInFAQsConnections match this filter */
              inFAQsConnection_ALL?: InputMaybe<FaqEntryInFaQsConnectionWhere>;
              /** Return FAQEntries where none of the related FAQEntryInFAQsConnections match this filter */
              inFAQsConnection_NONE?: InputMaybe<FaqEntryInFaQsConnectionWhere>;
              /** Return FAQEntries where one of the related FAQEntryInFAQsConnections match this filter */
              inFAQsConnection_SINGLE?: InputMaybe<FaqEntryInFaQsConnectionWhere>;
              /** Return FAQEntries where some of the related FAQEntryInFAQsConnections match this filter */
              inFAQsConnection_SOME?: InputMaybe<FaqEntryInFaQsConnectionWhere>;
              inFAQsAggregate?: InputMaybe<FaqEntryInFaQsAggregateInput>;
            };

            export type FaqOnCreateInput = {
              activated: Scalars[\\"Boolean\\"][\\"input\\"];
              name: Scalars[\\"String\\"][\\"input\\"];
            };

            export type FaqOptions = {
              limit?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              offset?: InputMaybe<Scalars[\\"Int\\"][\\"input\\"]>;
              /** Specify one or more FAQSort objects to sort Faqs by. The sorts will be applied in the order in which they are arranged in the array. */
              sort?: InputMaybe<Array<FaqSort>>;
            };

            export type FaqRelationInput = {
              entries?: InputMaybe<Array<FaqEntriesCreateFieldInput>>;
            };

            /** Fields to sort Faqs by. The order in which sorts are applied is not guaranteed when specifying many fields in one FAQSort object. */
            export type FaqSort = {
              id?: InputMaybe<SortDirection>;
              activated?: InputMaybe<SortDirection>;
              name?: InputMaybe<SortDirection>;
            };

            export type FaqUniqueWhere = {
              id?: InputMaybe<Scalars[\\"ID\\"][\\"input\\"]>;
            };

            export type FaqUpdateInput = {
              activated?: InputMaybe<Scalars[\\"Boolean\\"][\\"input\\"]>;
              name?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              entries?: InputMaybe<Array<FaqEntriesUpdateFieldInput>>;
            };

            export type FaqWhere = {
              id?: InputMaybe<Scalars[\\"ID\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              id_NOT?: InputMaybe<Scalars[\\"ID\\"][\\"input\\"]>;
              id_IN?: InputMaybe<Array<Scalars[\\"ID\\"][\\"input\\"]>>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              id_NOT_IN?: InputMaybe<Array<Scalars[\\"ID\\"][\\"input\\"]>>;
              id_CONTAINS?: InputMaybe<Scalars[\\"ID\\"][\\"input\\"]>;
              id_STARTS_WITH?: InputMaybe<Scalars[\\"ID\\"][\\"input\\"]>;
              id_ENDS_WITH?: InputMaybe<Scalars[\\"ID\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              id_NOT_CONTAINS?: InputMaybe<Scalars[\\"ID\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              id_NOT_STARTS_WITH?: InputMaybe<Scalars[\\"ID\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              id_NOT_ENDS_WITH?: InputMaybe<Scalars[\\"ID\\"][\\"input\\"]>;
              activated?: InputMaybe<Scalars[\\"Boolean\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              activated_NOT?: InputMaybe<Scalars[\\"Boolean\\"][\\"input\\"]>;
              name?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              name_IN?: InputMaybe<Array<Scalars[\\"String\\"][\\"input\\"]>>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT_IN?: InputMaybe<Array<Scalars[\\"String\\"][\\"input\\"]>>;
              name_CONTAINS?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              name_STARTS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              name_ENDS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT_CONTAINS?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT_STARTS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              /** @deprecated Negation filters will be deprecated, use the NOT operator to achieve the same behavior */
              name_NOT_ENDS_WITH?: InputMaybe<Scalars[\\"String\\"][\\"input\\"]>;
              OR?: InputMaybe<Array<FaqWhere>>;
              AND?: InputMaybe<Array<FaqWhere>>;
              NOT?: InputMaybe<FaqWhere>;
              /** @deprecated Use \`entries_SOME\` instead. */
              entries?: InputMaybe<FaqEntryWhere>;
              /** @deprecated Use \`entries_NONE\` instead. */
              entries_NOT?: InputMaybe<FaqEntryWhere>;
              /** Return FAQS where all of the related FAQEntries match this filter */
              entries_ALL?: InputMaybe<FaqEntryWhere>;
              /** Return FAQS where none of the related FAQEntries match this filter */
              entries_NONE?: InputMaybe<FaqEntryWhere>;
              /** Return FAQS where one of the related FAQEntries match this filter */
              entries_SINGLE?: InputMaybe<FaqEntryWhere>;
              /** Return FAQS where some of the related FAQEntries match this filter */
              entries_SOME?: InputMaybe<FaqEntryWhere>;
              /** @deprecated Use \`entriesConnection_SOME\` instead. */
              entriesConnection?: InputMaybe<FaqEntriesConnectionWhere>;
              /** @deprecated Use \`entriesConnection_NONE\` instead. */
              entriesConnection_NOT?: InputMaybe<FaqEntriesConnectionWhere>;
              /** Return FAQS where all of the related FAQEntriesConnections match this filter */
              entriesConnection_ALL?: InputMaybe<FaqEntriesConnectionWhere>;
              /** Return FAQS where none of the related FAQEntriesConnections match this filter */
              entriesConnection_NONE?: InputMaybe<FaqEntriesConnectionWhere>;
              /** Return FAQS where one of the related FAQEntriesConnections match this filter */
              entriesConnection_SINGLE?: InputMaybe<FaqEntriesConnectionWhere>;
              /** Return FAQS where some of the related FAQEntriesConnections match this filter */
              entriesConnection_SOME?: InputMaybe<FaqEntriesConnectionWhere>;
              entriesAggregate?: InputMaybe<FaqEntriesAggregateInput>;
            };

            export type ResolverTypeWrapper<T> = Promise<T> | T;

            export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
              resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
            };
            export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
              | ResolverFn<TResult, TParent, TContext, TArgs>
              | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

            export type ResolverFn<TResult, TParent, TContext, TArgs> = (
              parent: TParent,
              args: TArgs,
              context: TContext,
              info: GraphQLResolveInfo
            ) => Promise<TResult> | TResult;

            export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
              parent: TParent,
              args: TArgs,
              context: TContext,
              info: GraphQLResolveInfo
            ) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

            export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
              parent: TParent,
              args: TArgs,
              context: TContext,
              info: GraphQLResolveInfo
            ) => TResult | Promise<TResult>;

            export interface SubscriptionSubscriberObject<
              TResult,
              TKey extends string,
              TParent,
              TContext,
              TArgs
            > {
              subscribe: SubscriptionSubscribeFn<
                { [key in TKey]: TResult },
                TParent,
                TContext,
                TArgs
              >;
              resolve?: SubscriptionResolveFn<
                TResult,
                { [key in TKey]: TResult },
                TContext,
                TArgs
              >;
            }

            export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
              subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
              resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
            }

            export type SubscriptionObject<
              TResult,
              TKey extends string,
              TParent,
              TContext,
              TArgs
            > =
              | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
              | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

            export type SubscriptionResolver<
              TResult,
              TKey extends string,
              TParent = {},
              TContext = {},
              TArgs = {}
            > =
              | ((
                  ...args: any[]
                ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
              | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

            export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
              parent: TParent,
              context: TContext,
              info: GraphQLResolveInfo
            ) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

            export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
              obj: T,
              context: TContext,
              info: GraphQLResolveInfo
            ) => boolean | Promise<boolean>;

            export type NextResolverFn<T> = () => Promise<T>;

            export type DirectiveResolverFn<
              TResult = {},
              TParent = {},
              TContext = {},
              TArgs = {}
            > = (
              next: NextResolverFn<TResult>,
              parent: TParent,
              args: TArgs,
              context: TContext,
              info: GraphQLResolveInfo
            ) => TResult | Promise<TResult>;

            /** Mapping between all available schema types and the resolvers types */
            export type ResolversTypes = {
              Query: ResolverTypeWrapper<{}>;
              Int: ResolverTypeWrapper<Scalars[\\"Int\\"][\\"output\\"]>;
              String: ResolverTypeWrapper<Scalars[\\"String\\"][\\"output\\"]>;
              Mutation: ResolverTypeWrapper<{}>;
              SortDirection: SortDirection;
              CreateFaqEntriesMutationResponse: ResolverTypeWrapper<CreateFaqEntriesMutationResponse>;
              CreateFaqsMutationResponse: ResolverTypeWrapper<CreateFaqsMutationResponse>;
              CreateInfo: ResolverTypeWrapper<CreateInfo>;
              DeleteInfo: ResolverTypeWrapper<DeleteInfo>;
              FAQ: ResolverTypeWrapper<Faq>;
              ID: ResolverTypeWrapper<Scalars[\\"ID\\"][\\"output\\"]>;
              Boolean: ResolverTypeWrapper<Scalars[\\"Boolean\\"][\\"output\\"]>;
              FAQAggregateSelection: ResolverTypeWrapper<FaqAggregateSelection>;
              FAQEdge: ResolverTypeWrapper<FaqEdge>;
              FaqEntriesConnection: ResolverTypeWrapper<FaqEntriesConnection>;
              FAQEntriesConnection: ResolverTypeWrapper<FaqEntriesConnection>;
              FAQEntriesRelationship: ResolverTypeWrapper<FaqEntriesRelationship>;
              FAQEntry: ResolverTypeWrapper<FaqEntry>;
              FAQEntryAggregateSelection: ResolverTypeWrapper<FaqEntryAggregateSelection>;
              FAQEntryEdge: ResolverTypeWrapper<FaqEntryEdge>;
              FAQEntryFAQInFAQsAggregationSelection: ResolverTypeWrapper<FaqEntryFaqInFaQsAggregationSelection>;
              FAQEntryFAQInFAQsEdgeAggregateSelection: ResolverTypeWrapper<FaqEntryFaqInFaQsEdgeAggregateSelection>;
              FAQEntryFAQInFAQsNodeAggregateSelection: ResolverTypeWrapper<FaqEntryFaqInFaQsNodeAggregateSelection>;
              FaqEntryInFaq: ResolverTypeWrapper<FaqEntryInFaq>;
              FAQEntryInFAQsConnection: ResolverTypeWrapper<FaqEntryInFaQsConnection>;
              FAQEntryInFAQsRelationship: ResolverTypeWrapper<FaqEntryInFaQsRelationship>;
              FAQFAQEntryEntriesAggregationSelection: ResolverTypeWrapper<FaqfaqEntryEntriesAggregationSelection>;
              FAQFAQEntryEntriesEdgeAggregateSelection: ResolverTypeWrapper<FaqfaqEntryEntriesEdgeAggregateSelection>;
              FAQFAQEntryEntriesNodeAggregateSelection: ResolverTypeWrapper<FaqfaqEntryEntriesNodeAggregateSelection>;
              FaqsConnection: ResolverTypeWrapper<FaqsConnection>;
              IDAggregateSelection: ResolverTypeWrapper<IdAggregateSelection>;
              IntAggregateSelection: ResolverTypeWrapper<IntAggregateSelection>;
              Float: ResolverTypeWrapper<Scalars[\\"Float\\"][\\"output\\"]>;
              PageInfo: ResolverTypeWrapper<PageInfo>;
              StringAggregateSelection: ResolverTypeWrapper<StringAggregateSelection>;
              UpdateFaqEntriesMutationResponse: ResolverTypeWrapper<UpdateFaqEntriesMutationResponse>;
              UpdateFaqsMutationResponse: ResolverTypeWrapper<UpdateFaqsMutationResponse>;
              UpdateInfo: ResolverTypeWrapper<UpdateInfo>;
              FAQConnectInput: FaqConnectInput;
              FAQConnectOrCreateInput: FaqConnectOrCreateInput;
              FAQConnectOrCreateWhere: FaqConnectOrCreateWhere;
              FAQConnectWhere: FaqConnectWhere;
              FAQCreateInput: FaqCreateInput;
              FAQDeleteInput: FaqDeleteInput;
              FAQDisconnectInput: FaqDisconnectInput;
              FAQEntriesAggregateInput: FaqEntriesAggregateInput;
              FAQEntriesConnectFieldInput: FaqEntriesConnectFieldInput;
              FAQEntriesConnectionSort: FaqEntriesConnectionSort;
              FAQEntriesConnectionWhere: FaqEntriesConnectionWhere;
              FAQEntriesConnectOrCreateFieldInput: FaqEntriesConnectOrCreateFieldInput;
              FAQEntriesConnectOrCreateFieldInputOnCreate: FaqEntriesConnectOrCreateFieldInputOnCreate;
              FAQEntriesCreateFieldInput: FaqEntriesCreateFieldInput;
              FAQEntriesDeleteFieldInput: FaqEntriesDeleteFieldInput;
              FAQEntriesDisconnectFieldInput: FaqEntriesDisconnectFieldInput;
              FAQEntriesFieldInput: FaqEntriesFieldInput;
              FAQEntriesNodeAggregationWhereInput: FaqEntriesNodeAggregationWhereInput;
              FAQEntriesUpdateConnectionInput: FaqEntriesUpdateConnectionInput;
              FAQEntriesUpdateFieldInput: FaqEntriesUpdateFieldInput;
              FAQEntryConnectInput: FaqEntryConnectInput;
              FAQEntryConnectOrCreateInput: FaqEntryConnectOrCreateInput;
              FAQEntryConnectOrCreateWhere: FaqEntryConnectOrCreateWhere;
              FAQEntryConnectWhere: FaqEntryConnectWhere;
              FAQEntryCreateInput: FaqEntryCreateInput;
              FAQEntryDeleteInput: FaqEntryDeleteInput;
              FAQEntryDisconnectInput: FaqEntryDisconnectInput;
              FaqEntryInFaqAggregationWhereInput: FaqEntryInFaqAggregationWhereInput;
              FaqEntryInFaqCreateInput: FaqEntryInFaqCreateInput;
              FAQEntryInFAQsAggregateInput: FaqEntryInFaQsAggregateInput;
              FAQEntryInFAQsConnectFieldInput: FaqEntryInFaQsConnectFieldInput;
              FAQEntryInFAQsConnectionSort: FaqEntryInFaQsConnectionSort;
              FAQEntryInFAQsConnectionWhere: FaqEntryInFaQsConnectionWhere;
              FAQEntryInFAQsConnectOrCreateFieldInput: FaqEntryInFaQsConnectOrCreateFieldInput;
              FAQEntryInFAQsConnectOrCreateFieldInputOnCreate: FaqEntryInFaQsConnectOrCreateFieldInputOnCreate;
              FAQEntryInFAQsCreateFieldInput: FaqEntryInFaQsCreateFieldInput;
              FAQEntryInFAQsDeleteFieldInput: FaqEntryInFaQsDeleteFieldInput;
              FAQEntryInFAQsDisconnectFieldInput: FaqEntryInFaQsDisconnectFieldInput;
              FAQEntryInFAQsFieldInput: FaqEntryInFaQsFieldInput;
              FAQEntryInFAQsNodeAggregationWhereInput: FaqEntryInFaQsNodeAggregationWhereInput;
              FaqEntryInFaqSort: FaqEntryInFaqSort;
              FAQEntryInFAQsUpdateConnectionInput: FaqEntryInFaQsUpdateConnectionInput;
              FAQEntryInFAQsUpdateFieldInput: FaqEntryInFaQsUpdateFieldInput;
              FaqEntryInFaqUpdateInput: FaqEntryInFaqUpdateInput;
              FaqEntryInFaqWhere: FaqEntryInFaqWhere;
              FAQEntryOnCreateInput: FaqEntryOnCreateInput;
              FAQEntryOptions: FaqEntryOptions;
              FAQEntryRelationInput: FaqEntryRelationInput;
              FAQEntrySort: FaqEntrySort;
              FAQEntryUniqueWhere: FaqEntryUniqueWhere;
              FAQEntryUpdateInput: FaqEntryUpdateInput;
              FAQEntryWhere: FaqEntryWhere;
              FAQOnCreateInput: FaqOnCreateInput;
              FAQOptions: FaqOptions;
              FAQRelationInput: FaqRelationInput;
              FAQSort: FaqSort;
              FAQUniqueWhere: FaqUniqueWhere;
              FAQUpdateInput: FaqUpdateInput;
              FAQWhere: FaqWhere;
            };

            /** Mapping between all available schema types and the resolvers parents */
            export type ResolversParentTypes = {
              Query: {};
              Int: Scalars[\\"Int\\"][\\"output\\"];
              String: Scalars[\\"String\\"][\\"output\\"];
              Mutation: {};
              CreateFaqEntriesMutationResponse: CreateFaqEntriesMutationResponse;
              CreateFaqsMutationResponse: CreateFaqsMutationResponse;
              CreateInfo: CreateInfo;
              DeleteInfo: DeleteInfo;
              FAQ: Faq;
              ID: Scalars[\\"ID\\"][\\"output\\"];
              Boolean: Scalars[\\"Boolean\\"][\\"output\\"];
              FAQAggregateSelection: FaqAggregateSelection;
              FAQEdge: FaqEdge;
              FaqEntriesConnection: FaqEntriesConnection;
              FAQEntriesConnection: FaqEntriesConnection;
              FAQEntriesRelationship: FaqEntriesRelationship;
              FAQEntry: FaqEntry;
              FAQEntryAggregateSelection: FaqEntryAggregateSelection;
              FAQEntryEdge: FaqEntryEdge;
              FAQEntryFAQInFAQsAggregationSelection: FaqEntryFaqInFaQsAggregationSelection;
              FAQEntryFAQInFAQsEdgeAggregateSelection: FaqEntryFaqInFaQsEdgeAggregateSelection;
              FAQEntryFAQInFAQsNodeAggregateSelection: FaqEntryFaqInFaQsNodeAggregateSelection;
              FaqEntryInFaq: FaqEntryInFaq;
              FAQEntryInFAQsConnection: FaqEntryInFaQsConnection;
              FAQEntryInFAQsRelationship: FaqEntryInFaQsRelationship;
              FAQFAQEntryEntriesAggregationSelection: FaqfaqEntryEntriesAggregationSelection;
              FAQFAQEntryEntriesEdgeAggregateSelection: FaqfaqEntryEntriesEdgeAggregateSelection;
              FAQFAQEntryEntriesNodeAggregateSelection: FaqfaqEntryEntriesNodeAggregateSelection;
              FaqsConnection: FaqsConnection;
              IDAggregateSelection: IdAggregateSelection;
              IntAggregateSelection: IntAggregateSelection;
              Float: Scalars[\\"Float\\"][\\"output\\"];
              PageInfo: PageInfo;
              StringAggregateSelection: StringAggregateSelection;
              UpdateFaqEntriesMutationResponse: UpdateFaqEntriesMutationResponse;
              UpdateFaqsMutationResponse: UpdateFaqsMutationResponse;
              UpdateInfo: UpdateInfo;
              FAQConnectInput: FaqConnectInput;
              FAQConnectOrCreateInput: FaqConnectOrCreateInput;
              FAQConnectOrCreateWhere: FaqConnectOrCreateWhere;
              FAQConnectWhere: FaqConnectWhere;
              FAQCreateInput: FaqCreateInput;
              FAQDeleteInput: FaqDeleteInput;
              FAQDisconnectInput: FaqDisconnectInput;
              FAQEntriesAggregateInput: FaqEntriesAggregateInput;
              FAQEntriesConnectFieldInput: FaqEntriesConnectFieldInput;
              FAQEntriesConnectionSort: FaqEntriesConnectionSort;
              FAQEntriesConnectionWhere: FaqEntriesConnectionWhere;
              FAQEntriesConnectOrCreateFieldInput: FaqEntriesConnectOrCreateFieldInput;
              FAQEntriesConnectOrCreateFieldInputOnCreate: FaqEntriesConnectOrCreateFieldInputOnCreate;
              FAQEntriesCreateFieldInput: FaqEntriesCreateFieldInput;
              FAQEntriesDeleteFieldInput: FaqEntriesDeleteFieldInput;
              FAQEntriesDisconnectFieldInput: FaqEntriesDisconnectFieldInput;
              FAQEntriesFieldInput: FaqEntriesFieldInput;
              FAQEntriesNodeAggregationWhereInput: FaqEntriesNodeAggregationWhereInput;
              FAQEntriesUpdateConnectionInput: FaqEntriesUpdateConnectionInput;
              FAQEntriesUpdateFieldInput: FaqEntriesUpdateFieldInput;
              FAQEntryConnectInput: FaqEntryConnectInput;
              FAQEntryConnectOrCreateInput: FaqEntryConnectOrCreateInput;
              FAQEntryConnectOrCreateWhere: FaqEntryConnectOrCreateWhere;
              FAQEntryConnectWhere: FaqEntryConnectWhere;
              FAQEntryCreateInput: FaqEntryCreateInput;
              FAQEntryDeleteInput: FaqEntryDeleteInput;
              FAQEntryDisconnectInput: FaqEntryDisconnectInput;
              FaqEntryInFaqAggregationWhereInput: FaqEntryInFaqAggregationWhereInput;
              FaqEntryInFaqCreateInput: FaqEntryInFaqCreateInput;
              FAQEntryInFAQsAggregateInput: FaqEntryInFaQsAggregateInput;
              FAQEntryInFAQsConnectFieldInput: FaqEntryInFaQsConnectFieldInput;
              FAQEntryInFAQsConnectionSort: FaqEntryInFaQsConnectionSort;
              FAQEntryInFAQsConnectionWhere: FaqEntryInFaQsConnectionWhere;
              FAQEntryInFAQsConnectOrCreateFieldInput: FaqEntryInFaQsConnectOrCreateFieldInput;
              FAQEntryInFAQsConnectOrCreateFieldInputOnCreate: FaqEntryInFaQsConnectOrCreateFieldInputOnCreate;
              FAQEntryInFAQsCreateFieldInput: FaqEntryInFaQsCreateFieldInput;
              FAQEntryInFAQsDeleteFieldInput: FaqEntryInFaQsDeleteFieldInput;
              FAQEntryInFAQsDisconnectFieldInput: FaqEntryInFaQsDisconnectFieldInput;
              FAQEntryInFAQsFieldInput: FaqEntryInFaQsFieldInput;
              FAQEntryInFAQsNodeAggregationWhereInput: FaqEntryInFaQsNodeAggregationWhereInput;
              FaqEntryInFaqSort: FaqEntryInFaqSort;
              FAQEntryInFAQsUpdateConnectionInput: FaqEntryInFaQsUpdateConnectionInput;
              FAQEntryInFAQsUpdateFieldInput: FaqEntryInFaQsUpdateFieldInput;
              FaqEntryInFaqUpdateInput: FaqEntryInFaqUpdateInput;
              FaqEntryInFaqWhere: FaqEntryInFaqWhere;
              FAQEntryOnCreateInput: FaqEntryOnCreateInput;
              FAQEntryOptions: FaqEntryOptions;
              FAQEntryRelationInput: FaqEntryRelationInput;
              FAQEntrySort: FaqEntrySort;
              FAQEntryUniqueWhere: FaqEntryUniqueWhere;
              FAQEntryUpdateInput: FaqEntryUpdateInput;
              FAQEntryWhere: FaqEntryWhere;
              FAQOnCreateInput: FaqOnCreateInput;
              FAQOptions: FaqOptions;
              FAQRelationInput: FaqRelationInput;
              FAQSort: FaqSort;
              FAQUniqueWhere: FaqUniqueWhere;
              FAQUpdateInput: FaqUpdateInput;
              FAQWhere: FaqWhere;
            };

            export type QueryResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"Query\\"] = ResolversParentTypes[\\"Query\\"]
            > = {
              faqs?: Resolver<
                Array<ResolversTypes[\\"FAQ\\"]>,
                ParentType,
                ContextType,
                Partial<QueryFaqsArgs>
              >;
              faqsConnection?: Resolver<
                ResolversTypes[\\"FaqsConnection\\"],
                ParentType,
                ContextType,
                Partial<QueryFaqsConnectionArgs>
              >;
              faqsAggregate?: Resolver<
                ResolversTypes[\\"FAQAggregateSelection\\"],
                ParentType,
                ContextType,
                Partial<QueryFaqsAggregateArgs>
              >;
              faqEntries?: Resolver<
                Array<ResolversTypes[\\"FAQEntry\\"]>,
                ParentType,
                ContextType,
                Partial<QueryFaqEntriesArgs>
              >;
              faqEntriesConnection?: Resolver<
                ResolversTypes[\\"FaqEntriesConnection\\"],
                ParentType,
                ContextType,
                Partial<QueryFaqEntriesConnectionArgs>
              >;
              faqEntriesAggregate?: Resolver<
                ResolversTypes[\\"FAQEntryAggregateSelection\\"],
                ParentType,
                ContextType,
                Partial<QueryFaqEntriesAggregateArgs>
              >;
            };

            export type MutationResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"Mutation\\"] = ResolversParentTypes[\\"Mutation\\"]
            > = {
              createFaqs?: Resolver<
                ResolversTypes[\\"CreateFaqsMutationResponse\\"],
                ParentType,
                ContextType,
                RequireFields<MutationCreateFaqsArgs, \\"input\\">
              >;
              deleteFaqs?: Resolver<
                ResolversTypes[\\"DeleteInfo\\"],
                ParentType,
                ContextType,
                Partial<MutationDeleteFaqsArgs>
              >;
              updateFaqs?: Resolver<
                ResolversTypes[\\"UpdateFaqsMutationResponse\\"],
                ParentType,
                ContextType,
                Partial<MutationUpdateFaqsArgs>
              >;
              createFaqEntries?: Resolver<
                ResolversTypes[\\"CreateFaqEntriesMutationResponse\\"],
                ParentType,
                ContextType,
                RequireFields<MutationCreateFaqEntriesArgs, \\"input\\">
              >;
              deleteFaqEntries?: Resolver<
                ResolversTypes[\\"DeleteInfo\\"],
                ParentType,
                ContextType,
                Partial<MutationDeleteFaqEntriesArgs>
              >;
              updateFaqEntries?: Resolver<
                ResolversTypes[\\"UpdateFaqEntriesMutationResponse\\"],
                ParentType,
                ContextType,
                Partial<MutationUpdateFaqEntriesArgs>
              >;
            };

            export type CreateFaqEntriesMutationResponseResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"CreateFaqEntriesMutationResponse\\"] = ResolversParentTypes[\\"CreateFaqEntriesMutationResponse\\"]
            > = {
              info?: Resolver<ResolversTypes[\\"CreateInfo\\"], ParentType, ContextType>;
              faqEntries?: Resolver<
                Array<ResolversTypes[\\"FAQEntry\\"]>,
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type CreateFaqsMutationResponseResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"CreateFaqsMutationResponse\\"] = ResolversParentTypes[\\"CreateFaqsMutationResponse\\"]
            > = {
              info?: Resolver<ResolversTypes[\\"CreateInfo\\"], ParentType, ContextType>;
              faqs?: Resolver<Array<ResolversTypes[\\"FAQ\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type CreateInfoResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"CreateInfo\\"] = ResolversParentTypes[\\"CreateInfo\\"]
            > = {
              bookmark?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              nodesCreated?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              relationshipsCreated?: Resolver<
                ResolversTypes[\\"Int\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type DeleteInfoResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"DeleteInfo\\"] = ResolversParentTypes[\\"DeleteInfo\\"]
            > = {
              bookmark?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              nodesDeleted?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              relationshipsDeleted?: Resolver<
                ResolversTypes[\\"Int\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type FaqResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"FAQ\\"] = ResolversParentTypes[\\"FAQ\\"]
            > = {
              id?: Resolver<ResolversTypes[\\"ID\\"], ParentType, ContextType>;
              activated?: Resolver<ResolversTypes[\\"Boolean\\"], ParentType, ContextType>;
              name?: Resolver<ResolversTypes[\\"String\\"], ParentType, ContextType>;
              entriesAggregate?: Resolver<
                Maybe<ResolversTypes[\\"FAQFAQEntryEntriesAggregationSelection\\"]>,
                ParentType,
                ContextType,
                RequireFields<FaqEntriesAggregateArgs, \\"directed\\">
              >;
              entries?: Resolver<
                Array<ResolversTypes[\\"FAQEntry\\"]>,
                ParentType,
                ContextType,
                RequireFields<FaqEntriesArgs, \\"directed\\">
              >;
              entriesConnection?: Resolver<
                ResolversTypes[\\"FAQEntriesConnection\\"],
                ParentType,
                ContextType,
                RequireFields<FaqEntriesConnectionArgs, \\"directed\\">
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type FaqAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"FAQAggregateSelection\\"] = ResolversParentTypes[\\"FAQAggregateSelection\\"]
            > = {
              count?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              id?: Resolver<
                ResolversTypes[\\"IDAggregateSelection\\"],
                ParentType,
                ContextType
              >;
              name?: Resolver<
                ResolversTypes[\\"StringAggregateSelection\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type FaqEdgeResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"FAQEdge\\"] = ResolversParentTypes[\\"FAQEdge\\"]
            > = {
              cursor?: Resolver<ResolversTypes[\\"String\\"], ParentType, ContextType>;
              node?: Resolver<ResolversTypes[\\"FAQ\\"], ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type FaqEntriesConnectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"FaqEntriesConnection\\"] = ResolversParentTypes[\\"FaqEntriesConnection\\"]
            > = {
              totalCount?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              pageInfo?: Resolver<ResolversTypes[\\"PageInfo\\"], ParentType, ContextType>;
              edges?: Resolver<
                Array<ResolversTypes[\\"FAQEntryEdge\\"]>,
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type FaqEntriesConnectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"FAQEntriesConnection\\"] = ResolversParentTypes[\\"FAQEntriesConnection\\"]
            > = {
              edges?: Resolver<
                Array<ResolversTypes[\\"FAQEntriesRelationship\\"]>,
                ParentType,
                ContextType
              >;
              totalCount?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              pageInfo?: Resolver<ResolversTypes[\\"PageInfo\\"], ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type FaqEntriesRelationshipResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"FAQEntriesRelationship\\"] = ResolversParentTypes[\\"FAQEntriesRelationship\\"]
            > = {
              cursor?: Resolver<ResolversTypes[\\"String\\"], ParentType, ContextType>;
              node?: Resolver<ResolversTypes[\\"FAQEntry\\"], ParentType, ContextType>;
              properties?: Resolver<
                ResolversTypes[\\"FaqEntryInFaq\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type FaqEntryResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"FAQEntry\\"] = ResolversParentTypes[\\"FAQEntry\\"]
            > = {
              id?: Resolver<ResolversTypes[\\"ID\\"], ParentType, ContextType>;
              title?: Resolver<ResolversTypes[\\"String\\"], ParentType, ContextType>;
              body?: Resolver<ResolversTypes[\\"String\\"], ParentType, ContextType>;
              inFAQsAggregate?: Resolver<
                Maybe<ResolversTypes[\\"FAQEntryFAQInFAQsAggregationSelection\\"]>,
                ParentType,
                ContextType,
                RequireFields<FaqEntryInFaQsAggregateArgs, \\"directed\\">
              >;
              inFAQs?: Resolver<
                Array<ResolversTypes[\\"FAQ\\"]>,
                ParentType,
                ContextType,
                RequireFields<FaqEntryInFaQsArgs, \\"directed\\">
              >;
              inFAQsConnection?: Resolver<
                ResolversTypes[\\"FAQEntryInFAQsConnection\\"],
                ParentType,
                ContextType,
                RequireFields<FaqEntryInFaQsConnectionArgs, \\"directed\\">
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type FaqEntryAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"FAQEntryAggregateSelection\\"] = ResolversParentTypes[\\"FAQEntryAggregateSelection\\"]
            > = {
              count?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              id?: Resolver<
                ResolversTypes[\\"IDAggregateSelection\\"],
                ParentType,
                ContextType
              >;
              title?: Resolver<
                ResolversTypes[\\"StringAggregateSelection\\"],
                ParentType,
                ContextType
              >;
              body?: Resolver<
                ResolversTypes[\\"StringAggregateSelection\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type FaqEntryEdgeResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"FAQEntryEdge\\"] = ResolversParentTypes[\\"FAQEntryEdge\\"]
            > = {
              cursor?: Resolver<ResolversTypes[\\"String\\"], ParentType, ContextType>;
              node?: Resolver<ResolversTypes[\\"FAQEntry\\"], ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type FaqEntryFaqInFaQsAggregationSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"FAQEntryFAQInFAQsAggregationSelection\\"] = ResolversParentTypes[\\"FAQEntryFAQInFAQsAggregationSelection\\"]
            > = {
              count?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              node?: Resolver<
                Maybe<ResolversTypes[\\"FAQEntryFAQInFAQsNodeAggregateSelection\\"]>,
                ParentType,
                ContextType
              >;
              edge?: Resolver<
                Maybe<ResolversTypes[\\"FAQEntryFAQInFAQsEdgeAggregateSelection\\"]>,
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type FaqEntryFaqInFaQsEdgeAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"FAQEntryFAQInFAQsEdgeAggregateSelection\\"] = ResolversParentTypes[\\"FAQEntryFAQInFAQsEdgeAggregateSelection\\"]
            > = {
              position?: Resolver<
                ResolversTypes[\\"IntAggregateSelection\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type FaqEntryFaqInFaQsNodeAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"FAQEntryFAQInFAQsNodeAggregateSelection\\"] = ResolversParentTypes[\\"FAQEntryFAQInFAQsNodeAggregateSelection\\"]
            > = {
              id?: Resolver<
                ResolversTypes[\\"IDAggregateSelection\\"],
                ParentType,
                ContextType
              >;
              name?: Resolver<
                ResolversTypes[\\"StringAggregateSelection\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type FaqEntryInFaqResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"FaqEntryInFaq\\"] = ResolversParentTypes[\\"FaqEntryInFaq\\"]
            > = {
              position?: Resolver<Maybe<ResolversTypes[\\"Int\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type FaqEntryInFaQsConnectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"FAQEntryInFAQsConnection\\"] = ResolversParentTypes[\\"FAQEntryInFAQsConnection\\"]
            > = {
              edges?: Resolver<
                Array<ResolversTypes[\\"FAQEntryInFAQsRelationship\\"]>,
                ParentType,
                ContextType
              >;
              totalCount?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              pageInfo?: Resolver<ResolversTypes[\\"PageInfo\\"], ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type FaqEntryInFaQsRelationshipResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"FAQEntryInFAQsRelationship\\"] = ResolversParentTypes[\\"FAQEntryInFAQsRelationship\\"]
            > = {
              cursor?: Resolver<ResolversTypes[\\"String\\"], ParentType, ContextType>;
              node?: Resolver<ResolversTypes[\\"FAQ\\"], ParentType, ContextType>;
              properties?: Resolver<
                ResolversTypes[\\"FaqEntryInFaq\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type FaqfaqEntryEntriesAggregationSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"FAQFAQEntryEntriesAggregationSelection\\"] = ResolversParentTypes[\\"FAQFAQEntryEntriesAggregationSelection\\"]
            > = {
              count?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              node?: Resolver<
                Maybe<ResolversTypes[\\"FAQFAQEntryEntriesNodeAggregateSelection\\"]>,
                ParentType,
                ContextType
              >;
              edge?: Resolver<
                Maybe<ResolversTypes[\\"FAQFAQEntryEntriesEdgeAggregateSelection\\"]>,
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type FaqfaqEntryEntriesEdgeAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"FAQFAQEntryEntriesEdgeAggregateSelection\\"] = ResolversParentTypes[\\"FAQFAQEntryEntriesEdgeAggregateSelection\\"]
            > = {
              position?: Resolver<
                ResolversTypes[\\"IntAggregateSelection\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type FaqfaqEntryEntriesNodeAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"FAQFAQEntryEntriesNodeAggregateSelection\\"] = ResolversParentTypes[\\"FAQFAQEntryEntriesNodeAggregateSelection\\"]
            > = {
              id?: Resolver<
                ResolversTypes[\\"IDAggregateSelection\\"],
                ParentType,
                ContextType
              >;
              title?: Resolver<
                ResolversTypes[\\"StringAggregateSelection\\"],
                ParentType,
                ContextType
              >;
              body?: Resolver<
                ResolversTypes[\\"StringAggregateSelection\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type FaqsConnectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"FaqsConnection\\"] = ResolversParentTypes[\\"FaqsConnection\\"]
            > = {
              totalCount?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              pageInfo?: Resolver<ResolversTypes[\\"PageInfo\\"], ParentType, ContextType>;
              edges?: Resolver<Array<ResolversTypes[\\"FAQEdge\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type IdAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"IDAggregateSelection\\"] = ResolversParentTypes[\\"IDAggregateSelection\\"]
            > = {
              shortest?: Resolver<Maybe<ResolversTypes[\\"ID\\"]>, ParentType, ContextType>;
              longest?: Resolver<Maybe<ResolversTypes[\\"ID\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type IntAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"IntAggregateSelection\\"] = ResolversParentTypes[\\"IntAggregateSelection\\"]
            > = {
              max?: Resolver<Maybe<ResolversTypes[\\"Int\\"]>, ParentType, ContextType>;
              min?: Resolver<Maybe<ResolversTypes[\\"Int\\"]>, ParentType, ContextType>;
              average?: Resolver<Maybe<ResolversTypes[\\"Float\\"]>, ParentType, ContextType>;
              sum?: Resolver<Maybe<ResolversTypes[\\"Int\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type PageInfoResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"PageInfo\\"] = ResolversParentTypes[\\"PageInfo\\"]
            > = {
              hasNextPage?: Resolver<ResolversTypes[\\"Boolean\\"], ParentType, ContextType>;
              hasPreviousPage?: Resolver<
                ResolversTypes[\\"Boolean\\"],
                ParentType,
                ContextType
              >;
              startCursor?: Resolver<
                Maybe<ResolversTypes[\\"String\\"]>,
                ParentType,
                ContextType
              >;
              endCursor?: Resolver<
                Maybe<ResolversTypes[\\"String\\"]>,
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type StringAggregateSelectionResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"StringAggregateSelection\\"] = ResolversParentTypes[\\"StringAggregateSelection\\"]
            > = {
              shortest?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              longest?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UpdateFaqEntriesMutationResponseResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UpdateFaqEntriesMutationResponse\\"] = ResolversParentTypes[\\"UpdateFaqEntriesMutationResponse\\"]
            > = {
              info?: Resolver<ResolversTypes[\\"UpdateInfo\\"], ParentType, ContextType>;
              faqEntries?: Resolver<
                Array<ResolversTypes[\\"FAQEntry\\"]>,
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UpdateFaqsMutationResponseResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UpdateFaqsMutationResponse\\"] = ResolversParentTypes[\\"UpdateFaqsMutationResponse\\"]
            > = {
              info?: Resolver<ResolversTypes[\\"UpdateInfo\\"], ParentType, ContextType>;
              faqs?: Resolver<Array<ResolversTypes[\\"FAQ\\"]>, ParentType, ContextType>;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type UpdateInfoResolvers<
              ContextType = any,
              ParentType extends ResolversParentTypes[\\"UpdateInfo\\"] = ResolversParentTypes[\\"UpdateInfo\\"]
            > = {
              bookmark?: Resolver<Maybe<ResolversTypes[\\"String\\"]>, ParentType, ContextType>;
              nodesCreated?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              nodesDeleted?: Resolver<ResolversTypes[\\"Int\\"], ParentType, ContextType>;
              relationshipsCreated?: Resolver<
                ResolversTypes[\\"Int\\"],
                ParentType,
                ContextType
              >;
              relationshipsDeleted?: Resolver<
                ResolversTypes[\\"Int\\"],
                ParentType,
                ContextType
              >;
              __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
            };

            export type Resolvers<ContextType = any> = {
              Query?: QueryResolvers<ContextType>;
              Mutation?: MutationResolvers<ContextType>;
              CreateFaqEntriesMutationResponse?: CreateFaqEntriesMutationResponseResolvers<ContextType>;
              CreateFaqsMutationResponse?: CreateFaqsMutationResponseResolvers<ContextType>;
              CreateInfo?: CreateInfoResolvers<ContextType>;
              DeleteInfo?: DeleteInfoResolvers<ContextType>;
              FAQ?: FaqResolvers<ContextType>;
              FAQAggregateSelection?: FaqAggregateSelectionResolvers<ContextType>;
              FAQEdge?: FaqEdgeResolvers<ContextType>;
              FaqEntriesConnection?: FaqEntriesConnectionResolvers<ContextType>;
              FAQEntriesConnection?: FaqEntriesConnectionResolvers<ContextType>;
              FAQEntriesRelationship?: FaqEntriesRelationshipResolvers<ContextType>;
              FAQEntry?: FaqEntryResolvers<ContextType>;
              FAQEntryAggregateSelection?: FaqEntryAggregateSelectionResolvers<ContextType>;
              FAQEntryEdge?: FaqEntryEdgeResolvers<ContextType>;
              FAQEntryFAQInFAQsAggregationSelection?: FaqEntryFaqInFaQsAggregationSelectionResolvers<ContextType>;
              FAQEntryFAQInFAQsEdgeAggregateSelection?: FaqEntryFaqInFaQsEdgeAggregateSelectionResolvers<ContextType>;
              FAQEntryFAQInFAQsNodeAggregateSelection?: FaqEntryFaqInFaQsNodeAggregateSelectionResolvers<ContextType>;
              FaqEntryInFaq?: FaqEntryInFaqResolvers<ContextType>;
              FAQEntryInFAQsConnection?: FaqEntryInFaQsConnectionResolvers<ContextType>;
              FAQEntryInFAQsRelationship?: FaqEntryInFaQsRelationshipResolvers<ContextType>;
              FAQFAQEntryEntriesAggregationSelection?: FaqfaqEntryEntriesAggregationSelectionResolvers<ContextType>;
              FAQFAQEntryEntriesEdgeAggregateSelection?: FaqfaqEntryEntriesEdgeAggregateSelectionResolvers<ContextType>;
              FAQFAQEntryEntriesNodeAggregateSelection?: FaqfaqEntryEntriesNodeAggregateSelectionResolvers<ContextType>;
              FaqsConnection?: FaqsConnectionResolvers<ContextType>;
              IDAggregateSelection?: IdAggregateSelectionResolvers<ContextType>;
              IntAggregateSelection?: IntAggregateSelectionResolvers<ContextType>;
              PageInfo?: PageInfoResolvers<ContextType>;
              StringAggregateSelection?: StringAggregateSelectionResolvers<ContextType>;
              UpdateFaqEntriesMutationResponse?: UpdateFaqEntriesMutationResponseResolvers<ContextType>;
              UpdateFaqsMutationResponse?: UpdateFaqsMutationResponseResolvers<ContextType>;
              UpdateInfo?: UpdateInfoResolvers<ContextType>;
            };

            export interface FAQAggregateSelectionInput {
              count?: boolean;
              id?: boolean;
              name?: boolean;
            }

            export type FaqSelectionSet = SelectionSetObject<Faq, FaqResolvers>;
            export type InferFromFaqSelectionSet<TSelectionSet extends FaqSelectionSet> =
              InferFromSelectionSetObject<Faq, FaqResolvers, TSelectionSet>;

            export declare class FAQModel {
              public find(args?: {
                where?: FaqWhere;

                options?: FaqOptions;
                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<Faq[]>;
              public findSafe<TSelectionSet extends FaqSelectionSet>(args?: {
                where?: FaqWhere;

                options?: FaqOptions;
                selectionSet?: TSelectionSet;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<Prettify<InferFromFaqSelectionSet<TSelectionSet>>[]>;
              public create(args: {
                input: FaqCreateInput[];
                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<CreateFaqsMutationResponse>;
              public update(args: {
                where?: FaqWhere;
                update?: FaqUpdateInput;
                connect?: FaqConnectInput;
                disconnect?: FaqDisconnectInput;
                create?: FaqCreateInput;
                connectOrCreate?: FaqConnectOrCreateInput;
                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<UpdateFaqsMutationResponse>;
              public delete(args: {
                where?: FaqWhere;
                delete?: FaqDeleteInput;
                context?: any;
                rootValue?: any;
              }): Promise<{ nodesDeleted: number; relationshipsDeleted: number }>;
              public aggregate(args: {
                where?: FaqWhere;

                aggregate: FAQAggregateSelectionInput;
                context?: any;
                rootValue?: any;
              }): Promise<FaqAggregateSelection>;
            }

            export interface FAQEntryAggregateSelectionInput {
              count?: boolean;
              id?: boolean;
              title?: boolean;
              body?: boolean;
            }

            export type FaqEntrySelectionSet = SelectionSetObject<
              FaqEntry,
              FaqEntryResolvers
            >;
            export type InferFromFaqEntrySelectionSet<
              TSelectionSet extends FaqEntrySelectionSet
            > = InferFromSelectionSetObject<FaqEntry, FaqEntryResolvers, TSelectionSet>;

            export declare class FAQEntryModel {
              public find(args?: {
                where?: FaqEntryWhere;

                options?: FaqEntryOptions;
                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<FaqEntry[]>;
              public findSafe<TSelectionSet extends FaqEntrySelectionSet>(args?: {
                where?: FaqEntryWhere;

                options?: FaqEntryOptions;
                selectionSet?: TSelectionSet;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<Prettify<InferFromFaqEntrySelectionSet<TSelectionSet>>[]>;
              public create(args: {
                input: FaqEntryCreateInput[];
                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<CreateFaqEntriesMutationResponse>;
              public update(args: {
                where?: FaqEntryWhere;
                update?: FaqEntryUpdateInput;
                connect?: FaqEntryConnectInput;
                disconnect?: FaqEntryDisconnectInput;
                create?: FaqEntryCreateInput;
                connectOrCreate?: FaqEntryConnectOrCreateInput;
                selectionSet?: string | DocumentNode | SelectionSetNode;
                args?: any;
                context?: any;
                rootValue?: any;
              }): Promise<UpdateFaqEntriesMutationResponse>;
              public delete(args: {
                where?: FaqEntryWhere;
                delete?: FaqEntryDeleteInput;
                context?: any;
                rootValue?: any;
              }): Promise<{ nodesDeleted: number; relationshipsDeleted: number }>;
              public aggregate(args: {
                where?: FaqEntryWhere;

                aggregate: FAQEntryAggregateSelectionInput;
                context?: any;
                rootValue?: any;
              }): Promise<FaqEntryAggregateSelection>;
            }

            export interface ModelMap {
              FAQ: FAQModel;
              FAQEntry: FAQEntryModel;
            }
            "
        `);
    });
});
