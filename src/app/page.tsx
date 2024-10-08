'use client'
import { UserButton } from "@/components/user-button";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useEffect, useMemo } from "react";
import { useCreateWorkspaceModal } from "@/features/workspaces/store/use-create-workspace-modal";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
export default function Home() {
  const router = useRouter();
  const [open,setOpen] = useCreateWorkspaceModal();
  const {data,isLoading} = useGetWorkspaces();
  const workspaceId = useMemo(() => data?. [0]?._id, [data]);
  
  useEffect(() => {
    if(isLoading) return;

    if(workspaceId){
      router.replace(`/workspace/${workspaceId}`);
      console.log("Redirect to workspace", workspaceId);
    } else if(!open){
      setOpen(true)
    }
  },[workspaceId, isLoading, open, setOpen]);

  return (
    <div className="h-full items-center justify-center flex">
      <Loader className="size-6 animate-spin text-muted-foreground"/>   
  </div>
  );
}
