// Client-side rendering enabled for this component
'use client';

// Import necessary components and hooks
import { Button } from "@/components/ui/button";
import Image from "next/image";
import VerificationInput from 'react-verification-input';
import Link from "next/link";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useParams } from "next/navigation";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";
import { Loader } from "lucide-react";
import { useJoin } from "@/features/workspaces/api/use-join";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useMemo } from "react";

// Define the props expected by the JoinPage component
interface JoinPageProps {
    params: {
        workspaceId: string // The ID of the workspace to join
    };
};

// Component definition for JoinPage, which handles workspace joining
const JoinPage = ({ params }: JoinPageProps) => {
    const router = useRouter(); // Router for navigating between pages

    // Get the workspace ID using a custom hook
    const workspaceId = useWorkspaceId();
    console.log("Workspace ID from hook:", workspaceId); // Log the workspace ID obtained from the hook
    console.log("Workspace ID from params:", params.workspaceId); // Log the workspace ID obtained from the component's params

    // Destructure mutation function and pending status from the join hook
    const { mutate, isPending } = useJoin();
    // Fetch workspace information based on the workspace ID
    const { data, isLoading } = useGetWorkspaceInfo({ id: workspaceId });
    console.log("Workspace info data:", data); // Log workspace information data for debugging
    console.log("Loading status:", isLoading); // Log loading status to monitor API call progress

    // Determine if the user is a member of the workspace using useMemo for memoization
    const isMember = useMemo(() => data?.isMember, [data?.isMember]);
    console.log("Is user a member:", isMember); // Log the membership status

    // Redirect the user to the workspace page if they are already a member
    useEffect(() => {
        if (isMember) {
            console.log("User is not a member, redirecting to workspace page");
            router.push(`/workspace/${workspaceId}`);
        }
    }, [isMember, router, workspaceId]);

    // Handle completion of verification input (workspace join code)
    const handleComplete = (value: string) => {
        console.log("Verification code entered:", value); // Log the entered code for tracking
        mutate({ workspaceId, joinCode: value }, {
            // On successful join, redirect to workspace and show success toast
            onSuccess: (id) => {
                console.log("Join successful, redirecting to workspace:", id);
                router.replace(`/workspace/${id}`);
                toast.success("Workspace joined successfully");
            },
            // On error, show failure toast
            onError: () => {
                console.log("Failed to join workspace");
                toast.error("Failed to join workspace");
            }
        });
    };

    // Show a loading indicator if workspace information is still loading
    if (isLoading) {
        console.log("Loading workspace information...");
        return (
            <div className="h-full items-center justify-center flex">
                <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Render the main content once the data is loaded and ready
    return (
        <div className="h-full flex flex-col gap-y-8 items-center justify-center bg-white p-8 rounded-lg shadow-md">
            {/* Display the logo image */}
            <Image src="/logo.png" alt="logo" width={60} height={60} />
            <div className="flex flex-col gap-y-4 items-center justify-center max-w-md">
                <div className="flex flex-col gap-y-2 items-center justify-center">
                    {/* Show workspace name dynamically */}
                    <h1>Join {data?.name}</h1>
                    <p className="text-md text-muted-foreground">
                        Enter the workspace code to join
                    </p>
                </div>

                {/* Verification input for join code */}
                <VerificationInput
                    onComplete={handleComplete} // Function triggered on code entry completion
                    length={6} // Number of characters required for the join code
                    classNames={{
                        container: cn('flex gap-x-2', isPending && "opacity- cursor-not-allowed"), // Styling of container based on isPending state
                        character: "uppercase h-auto rounded-md border border-gray-300 flex items-center justify-center text-lg font-medium text-gray-500",
                        characterInactive: "bg-muted",
                        characterSelected: "bg-white text-black",
                        characterFilled: "bg-white text-black",
                    }}
                    autoFocus
                />
            </div>
            <div className="flex gap-x-4">
                {/* Button to navigate back to the home page */}
                <Button
                    size="lg"
                    variant={"outline"}
                    asChild
                >
                    <Link href="/">
                        Back to Home
                    </Link>
                </Button>
            </div>
        </div>
    );
};

// Export the component as default to allow import in other parts of the app
export default JoinPage;
