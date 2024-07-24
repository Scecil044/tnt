import { sendEmail } from "../config/email.js";
import Notification from "../models/Notification.model.js";
import User from "../models/User.model.js";

export const createNotification = async notificationBody => {
  try {
    const newNotification = await Notification.create({
      from: notificationBody.from,
      to: notificationBody.to,
      type: notificationBody.type
    });
    return newNotification;
  } catch (error) {
    throw new Error(error);
  }
};

export const getUserNotifications = async () => {
  try {
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const filterSystemNotifications = async reqQuery => {
  try {
    const { page = 1, limit = 10, sort = "createdAt", sortBy = "desc", search } = reqQuery;
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $match: {
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "from",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      {
        $lookup: {
          from: "users",
          localField: "to",
          foreignField: "_id",
          as: "toDetails"
        }
      },
      { $unwind: "$toDetails" }
    ];

    if (search) {
      const searchRegex = new RegExp(search, "i");
      pipeline.push({
        $match: {
          $or: [
            { type: { $regex: searchRegex } },
            { "userDetails.firstName": { $regex: searchRegex } },
            { "userDetails.lastName": { $regex: searchRegex } },
            { "userDetails.email": { $regex: searchRegex } },
            { "userDetails.userName": { $regex: searchRegex } }
          ]
        }
      });
    }

    pipeline.push(
      {
        $project: {
          _id: 1,
          createdAt: 1,
          updatedAt: 1,
          isDeleted: 1,
          type: 1,
          read: 1,
          from: {
            _id: "$userDetails._id",
            firstName: "$userDetails.firstName",
            lastName: "$userDetails.lastName",
            email: "$userDetails.email",
            userName: "$userDetails.userName"
          },
          to: {
            _id: "$toDetails._id",
            firstName: "$toDetails.firstName",
            lastName: "$toDetails.lastName",
            email: "$toDetails.email",
            userName: "$toDetails.userName"
          }
        }
      },
      {
        $sort: { [sort]: sortBy === "desc" ? -1 : 1 }
      },
      {
        $facet: {
          metadata: [{ $count: "total" }, { $addFields: { page, limit } }],
          data: [{ $skip: skip }, { $limit: parseInt(limit) }]
        }
      }
    );

    const [result] = await Notification.aggregate(pipeline);

    const notifications = result.data;
    const metadata = result.metadata[0];

    return {
      notifications,
      page: metadata?.page || page,
      limit: metadata?.limit || limit,
      totalPages: metadata?.total ? Math.ceil(metadata.total / limit) : 0,
      total: metadata?.total || 0
    };
  } catch (error) {
    console.error("Error in filterSystemNotifications:", error);
    throw error;
  }
};

export const notifyUsers = async (roleName, newUserData= null) => {
  try {
    const searchRegex = new RegExp(roleName, "i");
    const pipeline = [
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "roleDetails"
        }
      },
      {
        $unwind: "$roleDetails"
      },
      {
        $match: {
          isDeleted: false,
          "roleDetails.roleName": { $regex: searchRegex }
        }
      },
      {
        $project: {
          email: 1
        }
      }
    ];
    const response = await User.aggregate(pipeline);
    const userEmails = response.map(user => user => email);
    let mailBody = {};
    let cc = ["scecil072@gmail.com"];
    if (roleName == "admin") {
      mailBody = {
        to: userEmails,
        cc,
        subject: "User Creation",
        text: `Hi, a new user: ${newUserData.userName} has been created.`
      };
    }
    sendEmail(mailBody.to, mailBody.cc, mailBody.subject, mailBody.text).then(async result => {
      console.log(`Email sent successfully`, result);
    });
  } catch (error) {
    console.log(error);
    throw new Error("could not notify employees:" + error.message);
  }
};
