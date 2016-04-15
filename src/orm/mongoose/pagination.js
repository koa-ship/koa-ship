'use strict';

export default function pagination(schema) {
  schema.statics.paginate = async function paginate(context, options) {
    options = options || {};

    if (context.ctx) {
      context = context.ctx;
    }

    options.current = _.parseInt(context.query.page) || 1;
    options.conditions = options.conditions || {};
    options.columns = options.columns || null;
    options.sortBy = options.sortBy || { _id: -1 };
    options.pageSize = options.pageSize || 10;

    let count = await this.count(options.conditions).exec();
    let pageCount = Math.ceil(count/options.pageSize);

    options.current = (options.current < 1) ? 1 : options.current;
    options.current = (options.current > pageCount) ? pageCount : options.current;
    options.offset = (options.current * options.pageSize) - options.pageSize;    

    if (count == 0) {
      return {
        context: context,
        data: null,
        count: 0,
        current: options.current,
        pageSize: options.pageSize,
        pageCount: pageCount
      }
    }    

    let query = this.find(options.conditions)
        .skip(options.offset)
        .limit(options.pageSize)
        .sort(options.sortBy);

    if (options.columns) {
      query = query.select(options.columns);
    }

    if (options.populate) {
      query = query.populate(options.populate);
    }

    let data = await query.exec();

    return {
      context: context,
      data: data,
      count: count,
      current: options.current,
      pageSize: options.pageSize,
      pageCount: pageCount
    };
  };
};
