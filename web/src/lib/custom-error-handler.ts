import { error } from "@sveltejs/kit";

// Define the Error Handler type for clarity
type ErrorHandler = (err: Error, fn: Function) => never | any;

const defaultErrorHandler: ErrorHandler = (err: Error, fn: Function) => {
  console.error(
    "Some error occurred while calling",
    fn.name || "anonymous function",
  );
  error(500, "Some unknown error occurred");
};

export const HandleError = <Args extends any[], Return>({
  fn,
  errorHandler = defaultErrorHandler,
  errorCode = 500,
}: {
  fn: (...args: Args) => Return | Promise<Return>;
  errorHandler?: ErrorHandler;
  errorCode?: number;
}) => {
  return {
    run: async (...args: Args): Promise<Return> => {
      try {
        return await fn(...args);
      } catch (err: any) {
        if (err.status && err.body) throw err;
        return errorHandler(err, fn);
      }
    },

    next: <NextReturn>(
      nextFn: (arg: Return) => NextReturn | Promise<NextReturn>,
    ) => {
      return HandleError({
        fn: async (...args: Args): Promise<NextReturn> => {
          const result = await fn(...args);
          return nextFn(result);
        },
        errorHandler,
        errorCode,
      });
    },
  };
};
