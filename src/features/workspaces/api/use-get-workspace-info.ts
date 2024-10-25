import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
interface UseGetWorkspaceInfoProps{
    id: Id<"workspaces">
}

export const useGetWorkspaceInfo = ({id}: UseGetWorkspaceInfoProps) => {
    console.log("useGetWorkspaceInfo called with id:", id);
    const data = useQuery(api.workspaces.getInfoById, {id});
    console.log("Data from useGetWorkspaceInfo:", data);
    const isLoading = data === undefined;
    console.log("Is loading:", isLoading);

    return {data, isLoading}
}