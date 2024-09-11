import {atom, useAtom} from "jotai";

const modalState = atom(false);

export const useCreateWorkspaceModal = () => useAtom(modalState)