"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
var Role;
(function (Role) {
    Role[Role["Unauthorized"] = 0] = "Unauthorized";
    Role[Role["ReadOnly"] = 1] = "ReadOnly";
    Role[Role["ReadWrite"] = 2] = "ReadWrite";
    Role[Role["Admin"] = 3] = "Admin";
})(Role || (Role = {}));
exports.Role = Role;
