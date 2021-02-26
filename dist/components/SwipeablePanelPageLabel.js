var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import styled from 'styled-components';
var StyledPageLabel = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  position: absolute;\n  bottom: 4px;\n  right: 4px;\n\n  padding: 0 4px;\n  background-color: rgba(0, 0, 0, 0.7);\n  border-radius: 2px;\n\n  span {\n    font-size: 12px;\n    color: #ffffff;\n  }\n"], ["\n  position: absolute;\n  bottom: 4px;\n  right: 4px;\n\n  padding: 0 4px;\n  background-color: rgba(0, 0, 0, 0.7);\n  border-radius: 2px;\n\n  span {\n    font-size: 12px;\n    color: #ffffff;\n  }\n"])));
export var SwipeablePanelPageLabel = function (_a) {
    var length = _a.length, currentPage = _a.currentPage;
    return (_jsx(StyledPageLabel, { children: _jsxs("span", { children: [currentPage + 1, "/", length] }, void 0) }, void 0));
};
var templateObject_1;
