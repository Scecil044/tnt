import User from "../models/User.model.js";

export const genericfilter = async (reqQuery, reqBody) => {
  try {
    const searchRegex = new RegExp(reqBody.query, "i")
    let response;
    let filter ={
      isDeleted:false
    }
    let options={
      limit: reqQuery.limit ? parseInt(reqQuery.limit) : 10,
      page: reqQuery.page ? parseInt(reqQuery.page) : 1,
      sortBy:reqQuery.sortBy,
      select:"-password"
    }
    let body = [
        {
          $lookup:{
            from:"roles",
            localField:"roleId",
            foreignField:"_id",
            as:"roleDetails"
          }
        },
        {$unwind:"$roleDetails"},
        {
          $lookup:{
            from:"users",
            localField:"userId",
            foreignField:"_id",
            as:"userDetails"
          }
        },
        {$unwind:"$userDetails"},
        {
          $project:{
            firstName:"$userDetails.firstName",
            lastName:"$userDetails.lastName",
            email:0,
            fullName:{
              $concat:[
                "$userDetails.firstName",
                {
                 $cond:{
                  if:{$or:[{$eq:["$userDetails.middleName",null]},{$eq:["$userDetails.middleName", ""]}]},
                  then:"",
                  else:{
                    $concat:[" ", "$userDetails.middleName"]
                  }
                 }
                },
                {
                  $cond:{
                    if:{$or:[{$eq:["$userDetails.lastName", null]},{$eq:["$userDetails.lastName",""]}]},
                    then:"",
                    else:{$concat:[" ", "$userDetails.lastName"]}
                  }
                }
               
              ]
            },
            profilePicture:{
              $cond:{
                if:{$gt:["$userDetails.profilePicture",null]},
                then:"$userDetails.profilePicture",
                else:""
              }
            },
            coverPhoto:{
              $cond:{
                if:{$gt:["$userDetails.coverPhoto",null]},
                then:"$userDetails.coverPhoto",
                else:""
              }
            },
            role:"$roleDetails.roleName",
            bio:"$userDetails.bio",
          }
        }
    ];

   
    switch (reqBody.module) {
      case "users":
        if(reqBody.query){
          pipeline.push(
            {
              $match:{
                $or:[
                  {firstName:searchRegex},
                  {lastName:searchRegex},
                  {email:searchRegex},
                ]
              }
            },
          )
        }
        return await User.paginate(filter, options, body);
        break;
      case "roles":
        return await User.paginate(filter, options, body);
        break;
      default:
        throw new Error("Invalid module specified for filter");
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
