import { TokenDefinition, ERC20 } from "./blueprints";

const erc20 = new ERC20("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18n);

console.log(erc20.toHTMLString());
