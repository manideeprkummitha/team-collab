import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCallback, useMemo, useState } from "react";
import { Doc, Id } from "../../../../convex/_generated/dataModel";

type RequestType = { name: string,id: Id<"workspaces"> };
type ResponseType = Id<"workspaces"> | null;

type Options = {
  onSuccess?: (data: Id<"workspaces">) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
};

export const useUpdateWorkSpace = () => {
  const [status, setStatus] = useState<"success" | "error" | "settled" | "pending" | null>(null);
  const [data, setData] = useState<ResponseType>(null);
  const [error, setError] = useState<Error | null>(null);

  const isPending = useMemo(() => status === "pending", [status]);
  const isError = useMemo(() => status === "error", [status]);
  const isSettled = useMemo(() => status === "settled", [status]);
  const isSuccess = useMemo(() => status === "success", [status]);

  const mutation = useMutation(api.workspaces.update);

  const mutate = useCallback(
    async (values: RequestType, options?: Options) => {
      try {
        setData(null);
        setError(null);
        setStatus("pending");

        const response = await mutation(values);

        setData(response); // Store response in state
        options?.onSuccess?.(response);
        return response;
      } catch (error) {
        setStatus("error");
        options?.onError?.(error as Error);
        if (options?.throwError) {
          throw error;
        }
      } finally {
        setStatus("settled");
        options?.onSettled?.();
      }
    },
    [mutation]
  );

  return { mutate, data, error, isPending, isError, isSettled, isSuccess };
};