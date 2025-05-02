"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
async function mongoConnect() {
    mongoose_1.default.connect(process.env.MONGO_URI)
        .then(() => console.log('DB Connected!'))
        .catch(() => console.error('Failed to connect DB!'));
}
exports.default = mongoConnect;
