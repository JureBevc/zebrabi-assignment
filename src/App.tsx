import { ChangeEvent, useEffect, useRef, useState } from "react";
import HierarchyCalculation, {
  CalculationNode,
} from "./calc/hierarchy-calculation";
import * as d3 from "d3";
import ContextMenu, { ContextMenuDataType, ContextProps } from "./ContextMenu";

function App() {
  const d3Ref = useRef(null);

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuData, setContextMenuData] = useState<ContextMenuDataType>({
    position: {
      top: 0,
      left: 0,
    },
    calculationNode: null,
    nodeElement: null,
  });

  const createNodes = (hierarchyCalculation: HierarchyCalculation) => {
    if (hierarchyCalculation == null) {
      return;
    }

    const root = d3.select(d3Ref.current);
    root.html(""); // Clear existing nodes

    const drawNode = (rootElement: any, node: CalculationNode) => {
      // Create node root, register context menu
      let nodeElement = rootElement.append("node");
      let nodeData = nodeElement.append("node-data");
      nodeData.attr("class", node.calculationModifier);
      nodeData.on("contextmenu", (e: any) => {
        e.preventDefault();
        setContextMenuData({
          position: {
            top: e.pageY,
            left: e.pageX,
          },
          calculationNode: node,
          nodeElement: nodeElement,
        });
        setShowContextMenu(true);
      });

      // Display name and value
      nodeData
        .append("text")
        .attr("class", "node-name")
        .text(node.name + ":");
      nodeData
        .append("text")
        .attr("class", "node-value")
        .text(Math.round(node.currentValue * 100) / 100);

      // Create children
      if (node.children.length > 0) {
        let children = nodeElement.append("children");
        for (let childNode of node.children) {
          drawNode(children, childNode);
        }
      }
    };

    // Create tree, starting from root
    drawNode(root, hierarchyCalculation.rootNode);
  };

  useEffect(() => {
    // Clear context menu on click
    const windowClickHandler = () => setShowContextMenu(false);
    window.addEventListener("click", windowClickHandler);
    return () => window.removeEventListener("click", windowClickHandler);
  }, []);

  const calculationChange = (hierarchyCalculation: HierarchyCalculation) => {
    // Recalculate and recreate all nodes
    hierarchyCalculation.rootNode.calculateNodeValue();
    createNodes(hierarchyCalculation);
  };

  const inputFileChange = (fileEvent: ChangeEvent<HTMLInputElement>) => {
    if (fileEvent.target.files === null) {
      return;
    }

    const fileReader = new FileReader();
    fileReader.readAsText(fileEvent.target.files[0], "utf-8");
    fileReader.onload = (loadEvent) => {
      // Read file and parse JSON
      const fileContents = loadEvent.target?.result as string;
      const jsonContent = JSON.parse(fileContents);

      // Create the hiearchy structure
      const hierarchyCalculation = new HierarchyCalculation(jsonContent);
      hierarchyCalculation.changeListeners.push(calculationChange);
      createNodes(hierarchyCalculation);
    };
  };

  return (
    <div>
      <input type="file" onChange={inputFileChange} />
      <div id="d3-container" ref={d3Ref}></div>
      {showContextMenu && (
        <ContextMenu contextMenuData={contextMenuData}></ContextMenu>
      )}
    </div>
  );
}

export default App;
