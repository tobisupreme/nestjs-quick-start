import { AppUtilities } from '@@/app.utilities';
import { RequestWithUser } from '@@common/interfaces';
import { CrudMapType } from '@@common/interfaces/crud-map-type.interface';
import { Delegate } from '@@common/interfaces/delegate.interface';
import {
  HttpException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';

type QuerySchema = { key: string; where: (val?: any, obj?: any) => any };

export interface PageCursorsType {
  first?: PageCursorType;
  previous: PageCursorType;
  around?: [PageCursorType];
  next: PageCursorType;
  last?: PageCursorType;
}

interface PageEdgeType {
  cursor: string;
  node: any;
}

export interface PageCursorType {
  cursor: string;
  page: number;
  isCurrent: boolean;
}

export interface PaginationType {
  pageEdges: [PageEdgeType];
  pageCursors: PageCursorsType;
  totalCount: number;
}

@Injectable()
export abstract class CrudService<D extends Delegate, T extends CrudMapType> {
  constructor(protected delegate: D) {}

  public getDelegate(): D {
    return this.delegate;
  }

  public async aggregate(data: T['aggregate']) {
    const result = await this.delegate.aggregate(data);
    return result;
  }

  public async count(data: T['count']) {
    const result = await this.delegate.count(data);
    return result;
  }

  public async create(data: T['create']) {
    return this.delegate.create(data);
  }

  public async createMany(data: T['createMany']) {
    return this.delegate.createMany(data);
  }

  public async delete(data: T['delete']) {
    try {
      return await this.delegate.delete(data);
    } catch (error) {
      if (error?.code === 'P2003') {
        throw new NotAcceptableException(
          "Record cannot be deleted because it's linked to other record(s)",
        );
      }
      throw error;
    }
  }

  public async deleteMany(data: T['deleteMany']) {
    return this.delegate.deleteMany(data);
  }

  public async findFirst(data: T['findFirst']) {
    return this.delegate.findFirst(data);
  }

  public async findFirstOrThrow(
    data: T['findFirst'],
    errorOrMessage?: string | HttpException,
  ) {
    const result = await this.delegate.findFirst(data);
    if (!result) {
      const error =
        errorOrMessage && typeof errorOrMessage === 'string'
          ? new NotFoundException(errorOrMessage)
          : errorOrMessage;
      throw error || new NotFoundException('Record not found!');
    }
    return result;
  }

  public async findMany(data: T['findMany']) {
    return this.delegate.findMany(data);
  }

  public async findUnique(data: T['findUnique']) {
    return this.delegate.findUnique(data);
  }

  public async findUniqueOrThrow(
    data: T['findUnique'],
    errorOrMessage?: string | HttpException,
  ) {
    const result = await this.delegate.findUnique(data);
    if (!result) {
      const error =
        errorOrMessage && typeof errorOrMessage === 'string'
          ? new NotFoundException(errorOrMessage)
          : errorOrMessage;
      throw error || new NotFoundException('Record not found!');
    }
    return result;
  }

  public async update(data: T['update']) {
    return this.delegate.update(data);
  }

  public async updateMany(data: T['updateMany']) {
    return this.delegate.updateMany(data);
  }

  public async upsert(data: T['upsert']) {
    return this.delegate.upsert(data);
  }

  public async archive(id: string, authUser: RequestWithUser) {
    return this.delegate.update({
      where: { id },
      data: { status: false, updatedBy: authUser.user.userId },
    });
  }

  public async restoreArchived(id: string, authUser: RequestWithUser) {
    return this.delegate.update({
      where: { id },
      data: { status: true, updatedBy: authUser.user.userId },
    });
  }

  public parseQueryFilter(
    { term, ...filters }: Record<string, any>,
    querySchema: (string | QuerySchema)[],
  ) {
    let parsedTermFilters;
    const parsedFilters = {
      ...this.parseProps(filters, querySchema),
      ...this.parseOneToOne(filters, querySchema),
      ...this.parseOneToMany(filters, querySchema),
      ...this.parseFilterFunction(filters, querySchema),
    };
    if (term) {
      const parsedFilters = {
        ...this.parseProps({ term }, querySchema),
        ...this.parseOneToOne({ term }, querySchema),
        ...this.parseOneToMany({ term }, querySchema),
        ...this.parseFilterFunction({ term }, querySchema),
      };
      parsedTermFilters = {
        OR: Object.entries(parsedFilters || {}).map(([key, val]) => ({
          [key]: val,
        })),
      };
    }
    return {
      ...parsedFilters,
      ...parsedTermFilters,
    };
  }

  public async findManyPaginate(
    args: any,
    params: any = {},
    dataMapper?: (row: any, data?: any[], cachedData?: any) => any,
  ) {
    const {
      size = 25,
      cursor,
      orderBy: mOrderBy = args?.orderBy || 'createdAt',
      direction = 'desc',
      isPaginated = 'true',
      paginationType,
      page = 1,
    } = params;

    const orderBy =
      typeof mOrderBy === 'string' ? { [mOrderBy]: direction } : mOrderBy;

    if (isPaginated.toString().toLowerCase() === 'false') {
      return this.findMany({ ...args, orderBy });
    }

    if (paginationType === 'page') {
      const paginateData = {} as { skip?: number; take?: number };
      const take = size ? parseInt(size) : 25;
      paginateData.skip = (parseInt(page) - 1) * take;
      paginateData.take = take;
      const orderByCol = typeof mOrderBy === 'string' ? mOrderBy : undefined;

      let results = await this.findMany({
        ...args,
        ...paginateData,
        orderBy: {
          [orderByCol || 'createdAt']: direction ? direction : 'desc',
        },
      });
      const count = await this.count({
        where: args.where,
      });

      if (dataMapper && Array.isArray(results)) {
        let $__cachedData = {};
        results = await Promise.all(
          results.map(async (result) => {
            const { $__cachedData: sharedCachedData, ...mResult } =
              await dataMapper(result, results, $__cachedData);
            if (sharedCachedData) {
              $__cachedData = sharedCachedData;
            }

            return mResult;
          }),
        );
      }

      return {
        pageItems: results,
        pageMeta: {
          itemCount: results.length,
          totalItems: count,
          itemsPerPage: take,
          totalPages: Math.ceil(count / take),
          currentPage: page,
        },
      };
    }

    const totalCount = await this.delegate.count({ where: args.where });

    let decodedCursor: any = {};
    if (cursor) {
      try {
        decodedCursor = JSON.parse(AppUtilities.decode(cursor));
        args = {
          ...args,
          orderBy,
          skip: 1,
          take: Number(size + 1) * decodedCursor.dir,
          cursor: { id: decodedCursor.id },
        };
      } catch (error) {
        throw new NotAcceptableException('Invalid cursor!');
      }
    } else {
      args.take = size + 1;
      args.orderBy = orderBy;
    }

    let results = await this.delegate.findMany(args);
    if (dataMapper && Array.isArray(results)) {
      let $__cachedData = {};
      results = await Promise.all(
        results.map(async (result) => {
          const { $__cachedData: sharedCachedData, ...mResult } =
            await dataMapper(result, results, $__cachedData);
          if (sharedCachedData) {
            $__cachedData = sharedCachedData;
          }

          return mResult;
        }),
      );
    }

    // generate prev & next cursors
    let previous = null;
    let next = null;
    if (Array.isArray(results) && !!results.length) {
      const hasPrevious =
        decodedCursor.dir === 1 || (!!cursor && results.length > size) || null;
      const hasNext = decodedCursor.dir === -1 || results.length > size || null;

      // take out added record
      if (results.length > size) {
        [1, undefined].includes(decodedCursor.dir)
          ? results.pop()
          : results.shift();
      }

      const previousCursor = AppUtilities.encode(
        JSON.stringify({ id: results[0].id, dir: -1 }),
      );
      previous = hasPrevious && {
        cursor: previousCursor,
        page: null,
        isCurrent: false,
      };

      const nextCursor = AppUtilities.encode(
        JSON.stringify({ id: results[results.length - 1].id, dir: 1 }),
      );
      next = hasNext && {
        cursor: nextCursor,
        page: null,
        isCurrent: false,
      };
    }

    return {
      pageEdges: results.map((result) => ({ cursor: null, node: result })),
      pageCursors: { previous, next },
      totalCount,
    };
  }

  private parseProps(
    { term, ...filters }: Record<string, string | number>,
    querySchema: (string | QuerySchema)[],
  ) {
    return querySchema.reduce((acc, q) => {
      const [key, modifier = 'contains'] = String(q).split('|');
      if (
        typeof q === 'string' &&
        !q.match(/[\.:]/) &&
        (typeof filters[String(key)] !== 'undefined' ||
          (!!term && modifier === 'contains'))
      ) {
        const mode = modifier === 'contains' ? { mode: 'insensitive' } : {};
        acc[String(key)] = {
          [modifier]: filters[String(key)] || term,
          ...mode,
        };
      }
      return acc;
    }, {});
  }

  private parseOneToOne(
    { term, ...filters }: Record<string, string | number>,
    querySchema: (string | QuerySchema)[],
  ) {
    return querySchema.reduce((acc, q) => {
      if (typeof q !== 'string' || q.indexOf('.') === -1) {
        return acc;
      }
      const [key, modifier = 'contains'] = String(q).split('|');
      const [parent, relation] = String(key).split('.');
      if (
        (typeof filters[relation] === 'undefined' && !term) ||
        (!!term && modifier !== 'contains')
      ) {
        return acc;
      }
      const mode = modifier === 'contains' ? { mode: 'insensitive' } : {};
      if (!acc[parent]) {
        acc[parent] = term ? { OR: [] } : { AND: [] };
      }
      const aggregator = term ? acc[parent].OR : acc[parent].AND;
      aggregator.push({
        [relation]: {
          [modifier]: filters[relation] || term,
          ...mode,
        },
      });

      return acc;
    }, {});
  }

  private parseOneToMany(
    { term, ...filters }: Record<string, string | number>,
    querySchema: (string | QuerySchema)[],
  ) {
    return querySchema.reduce((acc, q) => {
      if (typeof q !== 'string' || q.indexOf(':') === -1) {
        return acc;
      }
      const [key, modifier = 'contains'] = String(q).split('|');
      const [parent, relation] = String(key).split(':');
      if (
        (typeof filters[relation] === 'undefined' && !term) ||
        (!!term && modifier !== 'contains')
      ) {
        return acc;
      }

      const mode = modifier === 'contains' ? { mode: 'insensitive' } : {};
      acc[parent] = {
        some: {
          [relation]: {
            [modifier]: filters[relation] || term,
            ...mode,
          },
        },
      };

      return acc;
    }, {});
  }

  private parseFilterFunction(
    filters: Record<string, string | number>,
    querySchema: (string | QuerySchema)[],
  ) {
    const parsed = querySchema.reduce((acc, q) => {
      if (typeof q !== 'string' && typeof filters[q.key] !== 'undefined') {
        const query = q.where(filters[q.key], filters);
        if (query) acc.push(query);
      }
      return acc;
    }, []);

    return parsed.length ? { AND: parsed } : undefined;
  }
}
