import {useQueryState} from "nuqs";
// import { useState } from "react";

// const [parentMessageId, setParentMessageId ] = useState(null); => 

export const useProfileMemberId = () => {
    return useQueryState("profileMemberId");
}