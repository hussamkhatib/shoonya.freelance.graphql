import { User } from "./models.js";
import countries from "./data/countries.js";

const resolvers = {
  Query: {
    user(_, args) {
      const { _id,filter } = args
      const shouldApplyFilters = filter !== undefined;
      if (!shouldApplyFilters) {
        return User.findById({ 
          _id 
        })
            }
    },
    countries(){
      console.log(countries) // returns proper data 
      return  countries ;
    }
  },


  
  
  Mutation: {
    async addUser(parent, args, context, info) {
      const { name,_id } = args;
      const userObj = new User({
        name,
        _id
      });
      try {
        const result = await userObj
          .save();
        return { ...result._doc };
      } catch (err) {
        console.error(err);
      }
    },
    updateUserNameTitle(_, args ) {
      const { _id, name , title } = args  
      return User.updateOne(
        { _id },
        { $set:  {
          name,
          title
        }}
        )
    },
    updateUserPicture(_,args) {
      const { _id, picture } = args  
      return User.updateOne(
        { _id },
        { $set:  {
          picture
        }}
        )
    },
    updateUserBio (_,args) {
      const { _id, bio } = args  
      return User.updateOne(
        { _id },
        { $set:  {
          bio
        }}
      )
    },
    updateUserContact (_,args) {
      const { _id, contact } = args 
      return User.updateOne(
        { _id },
        { $set:  {
          contact
        }}
      )
    },


    updateUserProfessionalExperience (_,args) {
      const { _id, professionalExperience } = args 
      return User.updateOne(
        { _id },
        { $set:  {
          professionalExperience 
        }}
      )
    },

    updateUserSkills (_,args) {
      const { _id, skills } = args 
      return User.updateOne(
        { _id },
        { $set:  {
          skills
        }}
      )
    },


    updateUserEducation (_,args) {
      const { _id, education } = args 
      return User.updateOne(
        { _id },
        { $set:  {
          education
        }}
      )
    },

    updateUserDeveloperCommunityInvolement (_,args) {
      const { _id, developerCommunityInvolement } = args 
      return User.updateOne(
        { _id },
        { $set:  {
          developerCommunityInvolement
        }}
      )
    },

    updateUserLanguages (_,args) {
      const { _id, languages } = args 
      return User.updateOne(
        { _id },
        { $set:  {
          languages
        }}
      )
    },
    updateUserHobbies (_,args) {
      const { _id, hobbies } = args 
      return User.updateOne(
        { _id },
        { $set:  {
          hobbies
        }}
      )
    },

    updateUserSports (_,args) {
      const { _id, sports } = args 
      return User.updateOne(
        { _id },
        { $set:  {
          sports
        }}
      )
    },

    updateUserCountriesICanWork (_,args) {
      const { _id, countriesICanWork } = args 
      return User.updateOne(
        { _id },
        { $set:  {
          countriesICanWork
        }}
      )
    },

  }
}

export default resolvers;
