import { gql } from "apollo-server-express";

const typeDefs = gql`
  type User {
    _id: ID!
    name: String
    title :String
    picture: String 
    bio: String
    contact: Contact
    professionalExperience: [ProfessionalExperience]
    skills : [Skills]
    education: [Education]
    developerCommunityInvolement: [DeveloperCommunityInvolement]
    languages: [String]
    hobbies: String
    sports: String
    countriesICanWork: [String]
  }

  type DeveloperCommunityInvolement {
    title: String 
    description : String
  }

  input DeveloperCommunityInvolementInput {
    title: String 
    description : String
  }

  type Education {
    degree: String
    school: String
    startYear: Int
    endYear: Int
  }

  input EducationInput {
    degree: String
    school: String
    startYear: Int
    endYear: Int
  }

  type Skills {
    name : String 
    scale : Int
  }

  input SkillsInput {
    name : String 
    scale : Int
  }

  type ProfessionalExperience {
    company : String
    jobTitle :  String
    location : String
    startYear : Int
    endYear : Int
    description : String
    currentJob : Boolean 
  }
  
  input ProfessionalExperienceInput {
    company : String
    jobTitle :  String  
    startYear :  Int
    endYear : Int
    location : String
    description : String
    currentJob : Boolean
  }

  type Contact {
    location : String 
    phone : String
    mail : String
    linkedin : String
    github : String
    twitter : String
  }

  input ContactInput {
    location : String 
    phone : String
    mail : String
    linkedin : String
    github : String
    twitter : String
  }

  type Query {
    user(_id : String): User
  }

  type Mutation {
    addUser(name: String, _id :String): User
    updateUserNameTitle( _id: ID!,name: String,title: String): User
    updateUserPicture ( _id: ID!, picture:String ): User
    updateUserBio ( _id: ID!, bio:String ) : User 
    updateUserContact ( _id: ID!, contact : ContactInput ) : User 
    updateUserProfessionalExperience ( _id: ID!, professionalExperience : [ProfessionalExperienceInput] ) : User 
    updateUserSkills ( _id: ID!, skills : [SkillsInput] ) : User 
    updateUserEducation  ( _id: ID!, education : [EducationInput] ) : User 
    updateUserDeveloperCommunityInvolement  ( _id: ID!, developerCommunityInvolement : [DeveloperCommunityInvolementInput] ) : User 
    updateUserLanguages  ( _id: ID!, languages : [String] ) : User 
    updateUserHobbies  ( _id: ID!, hobbies : String ) : User 
    updateUserSports  ( _id: ID!, sports : String ) : User 
    updateUserCountriesICanWork  ( _id: ID!, countriesICanWork : [String] ) : User 
  }
`;

export default typeDefs;
