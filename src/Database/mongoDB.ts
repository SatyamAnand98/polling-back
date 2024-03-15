import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

class Database {
    private static DB_URL: string =
        process.env.ENV === "LOCAL"
            ? process.env.DB_LOCAL || ""
            : process.env.ENV == "DEV"
            ? process.env.DB_DEV || ""
            : process.env.DB_PROD || "";

    private static DB_USER: string =
        process.env.ENV === "LOCAL"
            ? process.env.DB_USER_LOCAL || ""
            : process.env.ENV == "DEV"
            ? process.env.DB_USER_DEV || ""
            : process.env.DB_USER_PROD || "";

    private static DB_PASSWORD: string =
        process.env.ENV === "LOCAL"
            ? process.env.DB_PASSWORD_LOCAL || ""
            : process.env.ENV == "DEV"
            ? process.env.DB_PASSWORD_DEV || ""
            : process.env.DB_PASSWORD_PROD || "";

    private static DB_NAME: string = "intervue_io";

    public static mongodbConnection: typeof mongoose | undefined = undefined;

    public static async connect() {
        this.checkConnection();
    }

    static async checkConnection() {
        if (this.mongodbConnection) {
            return this.mongodbConnection;
        }

        this.createConnection();
    }

    private static async createConnection(): Promise<void> {
        if (!this.DB_URL) {
            throw new Error("Database URL is not provided.");
        }

        this.mongodbConnection = await mongoose.connect(this.DB_URL, {
            dbName: this.DB_NAME,
            user: this.DB_USER,
            pass: this.DB_PASSWORD,
        });

        console.log("✅ Mongoose has connected successfully.");

        mongoose.connection.on("connected", () => {
            console.log("✅ Mongoose has connected successfully.");
        });

        mongoose.connection.on("reconnected", () => {
            console.log("✅ Mongoose has reconnected successfully.");
        });

        mongoose.connection.on("error", (error) => {
            console.log("❌ Mongoose connection has an error", error);
            mongoose.disconnect();
        });
    }

    public static async closeConnection(): Promise<void> {
        if (this.mongodbConnection) {
            await this.mongodbConnection.disconnect();
            console.log("✅ Mongoose has disconnected successfully.");
        } else {
            console.log("❌ There is no active connection to close.");
        }
    }

    public static async dropDatabase(): Promise<void> {
        if (!this.mongodbConnection) {
            throw new Error("❌ There is no active connection to drop.");
        }

        await this.mongodbConnection.connection.db.dropDatabase();
    }

    public static async removeModel(modelName: string): Promise<void> {
        if (!this.mongodbConnection) {
            throw new Error(
                "❌ There is no active connection to remove model."
            );
        }

        delete this.mongodbConnection.models[modelName];
    }
}

const mongodbDatabase = Database;
export default mongodbDatabase;
