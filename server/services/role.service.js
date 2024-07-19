import Role from "../models/Role.model.js";

export const storeRole = async (reqBody) => {
    try {
      const searchRegex = new RegExp(reqBody.roleName, "i");
      const role = await Role.findOne({ roleName: searchRegex, isDeleted: false });
      if (role) throw new Error("Role already exists");
      // create a new role with provided details
      const newRole = new Role({
        roleName: reqBody.roleName
      })
      await newRole.save()
      if(!newRole) throw new Error("Could not save role!")
      return newRole;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  export const getSystemRoles = async(reqQuery)=>{
    try {
        const searchRegex = new RegExp(reqQuery.search, "i")
        const page = reqQuery.page ? parseInt(reqQuery.page) : 1;
        const limit = reqQuery.limit ? parseInt(reqQuery.limit) : 20;
        const sortDirection = reqQuery.sortDirection ? parseInt(reqQuery.sortDirection) : -1;
        const sortBy = reqQuery.sortBy || "createdAt"
        const roles = await Role.find(
            {
                isDeleted:false,
                roleName : searchRegex
            }
        ).skip((page-1)*limit).limit(limit).sort({[sortBy]: sortDirection})
        return roles
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
  }

export const getRoleByName = async roleName => {
  try {
    const searchRegex = new RegExp(roleName, "i");
    const role = await Role.findOne({ roleName: searchRegex, isDeleted: false }).select("roleName");
    if (!role) throw new Error("Unable to find role by the provided name");
    console.log("found role", role)
    return role;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const getRoleById = async id => {
  try {
    const role = await Role.findById(id)
      .where({ isDeleted: false })
      .select("roleName");
    if (!role) throw new Error("No role with matching id was found");
    return role;
  } catch (error) {
    throw new Error(error);
  }
};


export const updateRoleDetails = async (reqBody, roleId) => {
    try {
      const role = await Role.findById(roleId)
        .where({ isDeleted: false })
      if (!role) throw new Error("No role with matching id was found");

      // assign whatever is in reqBody a placeholder name
      const updates = Object.keys(reqBody)
      updates.forEach((update)=>{
        role[update] = reqBody[update]
      })
      await role.save()
      return role;
    } catch (error) {
      throw new Error(error);
    }
  };


export const discardRole = async id => {
    try {
      const role = await Role.findById(id)
        .where({ isDeleted: false })
      if (!role) throw new Error("No role with matching id was found");
      role.isDeleted = !isDeleted
      await role.save()
      return role;
    } catch (error) {
      throw new Error(error);
    }
  };
