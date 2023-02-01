import {
  CalculationModifier,
  CalculationNode,
} from "./calc/hierarchy-calculation";

export type ContextMenuDataType = {
  position: {
    left: number;
    top: number;
  };
  calculationNode: CalculationNode | null;
  nodeElement: any;
};

export type ContextProps = {
  contextMenuData: ContextMenuDataType;
};

export default function ContextMenu(props: ContextProps) {
  const { position, calculationNode, nodeElement } = props.contextMenuData;

  return (
    <div
      className="context-menu"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div
        onClick={() => {
          nodeElement.classed(
            "node-collapsed",
            nodeElement.classed("node-collapsed") ? false : true
          );
        }}
      >
        Expand / Collapse
      </div>
      <hr></hr>
      <div
        onClick={() =>
          calculationNode?.setCalculationModifier(CalculationModifier.NONE)
        }
      >
        Unaltered
      </div>
      <div
        onClick={() =>
          calculationNode?.setCalculationModifier(CalculationModifier.IGNORE)
        }
      >
        Skip
      </div>
      <div
        onClick={() =>
          calculationNode?.setCalculationModifier(CalculationModifier.NEGATE)
        }
      >
        Negate
      </div>
    </div>
  );
}
