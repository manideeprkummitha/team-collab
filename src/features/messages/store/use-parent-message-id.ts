import {useQueryState} from "nuqs";
// import { useState } from "react";

// const [parentMessageId, setParentMessageId ] = useState(null); => 

export const useParentMessageId = () => {
    return useQueryState("parentMessageId");
}