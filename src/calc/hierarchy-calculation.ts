export default class HierarchyCalculation {
  data: Object;
  rootNode: CalculationNode;
  changeListeners: ((hierarchyCalculation: HierarchyCalculation) => void)[] =
    [];

  constructor(data: Object) {
    // Create calculation tree
    this.data = data;
    this.rootNode = this.parseObject(data);
    this.rootNode.calculateNodeValue();
  }

  parseObject(objData: Object) {
    const [nodeName, nodeValue] = Object.entries(objData)[0];

    if (nodeValue instanceof Array) {
      const node = new CalculationNode(this, nodeName, 0);
      node.children = this.parseArray(nodeValue as Array<Object>);
      return node;
    } else if (typeof nodeValue === "number") {
      const node = new CalculationNode(this, nodeName, nodeValue as number);
      return node;
    }

    throw new Error(`Invalid object value type ${typeof nodeValue}`);
  }

  parseArray(arrayData: Array<Object>) {
    let nodeList: CalculationNode[] = [];
    arrayData.forEach((objData) => nodeList.push(this.parseObject(objData)));
    return nodeList;
  }

  triggerCalculationChange() {
    for (let listener of this.changeListeners) {
      listener(this);
    }
  }
}

export enum CalculationModifier {
  NONE = "no-modifier",
  NEGATE = "negate-modifier",
  IGNORE = "ignore-modifier",
}

export class CalculationNode {
  hierarchyCalculation: HierarchyCalculation;
  name: string;
  initalValue: number;

  calculationModifier = CalculationModifier.NONE;
  currentValue = 0;
  children: CalculationNode[] = [];

  constructor(
    hierarchyCalculation: HierarchyCalculation,
    name: string,
    initialValue: number
  ) {
    this.hierarchyCalculation = hierarchyCalculation;
    this.name = name;
    this.initalValue = initialValue;
  }

  calculateNodeValue() {
    // Calculate value for this node
    this.currentValue = this.initalValue;
    if (this.children.length > 0) {
      for (let node of this.children) {
        let childValue = node.calculateNodeValue();
        this.currentValue += childValue;
      }
    }

    // Apply modifier
    switch (this.calculationModifier) {
      case CalculationModifier.NONE:
        return this.currentValue;
      case CalculationModifier.IGNORE:
        return 0;
      case CalculationModifier.NEGATE:
        return -this.currentValue;
    }
  }

  setCalculationModifier(modifier: CalculationModifier) {
    this.calculationModifier = modifier;
    this.hierarchyCalculation.triggerCalculationChange();
  }
}
