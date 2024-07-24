import Log from "../models/Log.model.js";
import { errorHandler } from "../utils/errorHandler.js";

export const createLog = async (theModule, userId, message) => {
  try {
    console.log(userId, theModule, message);
    const newLog = Log.create({
      module: theModule,
      user: userId,
      message
    });
    if (!newLog) return errorHandler(400, "could not create log");
    return newLog;
  } catch (error) {
    console.log(error);
    return errorHandler(400, error);
  }
};

export const filterLogs = async reqQuery => {
  try {
    const pipeline = [
      {
        $match: {
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" }
    ];

    if (reqQuery.search) {
      const searchRegex = new RegExp(reqQuery.search, "i");

      pipeline.push({
        $match: {
          $or: [
            { message: { $regex: searchRegex } },
            { module: { $regex: searchRegex } },
            { "userDetails.firstName": { $regex: searchRegex } },
            { "userDetails.lastName": { $regex: searchRegex } },
            { "userDetails.email": { $regex: searchRegex } }
          ]
        }
      });
    }
    pipeline.push({
      $project: {
        _id: 1,
        message: 1,
        module: 1,
        createdAt: 1,
        updatedAt: 1,
        isDeleted:1,
        user: {
          firstName: "$userDetails.firstName",
          lastName: "$userDetails.lastName",
          email: "$userDetails.email"
        }
      }
    });
    const response = await Log.aggregate(pipeline);
    console.log("answer");
    return response;
  } catch (error) {
    console.log(error);
    throw new Error("Error populating logs: " + error.message);
  }
};
