import { useReducer } from "react";

const initialState = {
  blocks: [],
  status: "idle", // 'idle' | 'saving' | 'error'
};

function blocksReducer(state, action) {
  switch (action.type) {
    case "SET_BLOCKS":
      return { ...state, blocks: action.payload, status: "idle" };

    case "ADD_BLOCK":
      return { ...state, blocks: [...state.blocks, action.payload] };

    case "INSERT_BLOCK_AFTER": {
      const { afterId, newBlock } = action.payload;
      const index = state.blocks.findIndex((b) => b._id === afterId);
      const updated = [...state.blocks];
      updated.splice(index + 1, 0, newBlock);
      return {
        ...state,
        blocks: updated.map((b, i) => ({ ...b, order: i + 1 })),
      };
    }

    case "UPDATE_BLOCK_CONTENT":
      return {
        ...state,
        blocks: state.blocks.map((b) =>
          b._id === action.payload.id
            ? { ...b, content: action.payload.content }
            : b,
        ),
      };

    case "UPDATE_BLOCK_TYPE":
      return {
        ...state,
        blocks: state.blocks.map((b) =>
          b._id === action.payload.id ? { ...b, type: action.payload.type } : b,
        ),
      };

    case "DELETE_BLOCK":
      return {
        ...state,
        blocks: state.blocks.filter((b) => b._id !== action.payload),
      };

    case "REORDER_BLOCKS":
      return { ...state, blocks: action.payload };

    case "SET_STATUS":
      return { ...state, status: action.payload };

    case "SET_DRAGGED":
      return state;

    default:
      return state;
  }
}

export function useBlocksReducer() {
  const [state, dispatch] = useReducer(blocksReducer, initialState);
  return { state, dispatch };
}
