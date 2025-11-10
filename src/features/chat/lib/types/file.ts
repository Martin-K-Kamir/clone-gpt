import {
    CHAT_MESSAGE_TYPE,
    CHAT_MESSAGE_TYPES,
} from "@/features/chat/lib/constants";

export type StoredGeneratedImage = {
    imageId: string;
    name: string;
    imageUrl: string;
};

export type StoredGeneratedFile = {
    fileId: string;
    name: string;
    fileUrl: string;
};

export type StoredUploadedFile = {
    fileId: string;
    name: string;
    fileUrl: string;
    mediaType: string;
    extension: string;
    size: number;
};

export type ChatMessageTypeMap = {
    [K in keyof typeof CHAT_MESSAGE_TYPE]: (typeof CHAT_MESSAGE_TYPE)[K];
};
export type ChatMessageType = (typeof CHAT_MESSAGE_TYPES)[number];

export type ChatUploadedFile = (
    | {
          kind: ChatMessageTypeMap["TEXT"];
          text: string;
      }
    | {
          kind: ChatMessageTypeMap["FILE"];
      }
    | {
          kind: ChatMessageTypeMap["IMAGE"];
          width: number | null;
          height: number | null;
      }
) &
    StoredUploadedFile;

type UIFileMessageBasePart = {
    name: string;
    url: string;
    mediaType: string;
    size: number;
    extension: string;
};

export type UIFileMessagePart = (
    | {
          kind: ChatMessageTypeMap["FILE"];
          type: ChatMessageTypeMap["FILE"];
      }
    | {
          kind: ChatMessageTypeMap["IMAGE"];
          type: ChatMessageTypeMap["FILE"];
          width: number | null;
          height: number | null;
      }
    | {
          kind: ChatMessageTypeMap["FILE"];
          type: ChatMessageTypeMap["TEXT"];
          text: string;
          isVisible: false;
      }
) &
    UIFileMessageBasePart;
