import { Project, Proposal, User } from "../models.js";
import mongoose from "mongoose";
import Server from "apollo-server-express";

const { ObjectId } = mongoose.Types;

const projectResolver = {
  Query: {
    async getUserProjects(_, args, context) {
      const { userId } = context;
      const projectArray = await User.findOne(
        {
          _id: userId,
        },
        {
          projects: 1,
          _id: 0,
        }
      );

      return await Project.find({
        _id: {
          $in: projectArray.projects,
        },
      });
    },

    async getUserCurrentProjects(_, args, context) {
      const { userId } = context;
      const projectArray = await User.findOne(
        {
          _id: userId,
        },
        {
          projects: 1,
          _id: 0,
        }
      );
      return Project.find({
        $and: [
          {
            _id: {
              $in: projectArray.projects,
            },
          },
          {
            isPublished: {
              $eq: true,
            },
          },
          {
            freelancers: {
              $exists: true,
              $ne: [],
            },
          },
        ],
      });
    },

    async getUserActiveProjects(_, args, context) {
      const { userId } = context;
      const getUserProposals = await User.findOne(
        {
          _id: userId,
        },
        {
          _id: 0,
          proposals: 1,
        }
      );
      if (!getUserProposals.proposals.length) return [];
      const getProjectIdsOfAcceptedProposals = await Proposal.find(
        {
          $and: [
            {
              _id: {
                $in: getUserProposals.proposals,
              },
            },
            {
              verdict: {
                $eq: "hired",
              },
            },
          ],
        },
        {
          _id: 0,
          projectId: 1,
        }
      );
      const projectIds = getProjectIdsOfAcceptedProposals.map(
        (proposal) => proposal.projectId
      );

      return await Project.find({
        _id: {
          $in: projectIds,
        },
      });
    },

    project(_, args) {
      const { _id } = args;
      return Project.findById({
        _id,
      });
    },

    async getProjectsByUserProposals(_, args, context) {
      const { userId } = context;
      const proposalIds = await User.findOne(
        {
          _id: userId,
        },
        {
          proposals: 1,
          _id: 0,
        }
      );
      const projectIdsArr = await Proposal.find(
        {
          _id: {
            $in: proposalIds.proposals,
          },
        },
        {
          projectId: 1,
          _id: 0,
        }
      );

      const projectIds = projectIdsArr.map((projectId) => projectId.projectId);
      return await Project.find({
        _id: {
          $in: projectIds,
        },
      });
    },

    projects(_, args, context) {
      const { userId } = context;
      const { input } = args;
      if (!input) return Project.find({});

      let arr = [];
      if (input.title)
        arr.push({
          $search: {
            index: "projects",
            text: {
              query: input.title,
              path: "title",
              fuzzy: {
                maxEdits: 1,
              },
            },
          },
        });

      arr.push({
        $match: {
          owner: {
            $not: {
              $eq: ObjectId(userId),
            },
          },
        },
      });

      if (
        (input?.fixed || input?.hourly) &&
        (input?.fixed?.min ||
          input?.fixed?.max ||
          input?.hourly?.min ||
          input?.hourly?.max)
      )
        arr.push({
          $match: {
            $or: [
              {
                $and: [
                  {
                    "budget.amount": {
                      ...(input?.fixed?.checked &&
                        input?.fixed?.currency && {
                          ...(input?.fixed?.min && { $gt: input?.fixed.min }),
                          ...(input?.fixed?.max && { $lt: input?.fixed.max }),
                        }),
                    },
                  },
                  {
                    "budget.currency": {
                      $eq: input?.fixed?.currency,
                    },
                  },
                  {
                    "budget.type": { $eq: "fixed rate" },
                  },
                ],
              },

              {
                $and: [
                  {
                    "budget.amount": {
                      ...(input?.hourly?.checked &&
                        input?.hourly?.currency && {
                          ...(input?.hourly?.min && { $gt: input?.hourly.min }),
                          ...(input?.hourly?.max && { $lt: input?.hourly.max }),
                        }),
                    },
                  },
                  {
                    "budget.currency": {
                      $eq: input?.hourly?.currency,
                    },
                  },
                  {
                    "budget.type": { $eq: "hourly rate" },
                  },
                ],
              },
            ],
          },
        });

      if (input.skills?.length)
        arr.push({
          $match: {
            skills: { $all: input.skills },
          },
        });

      if (!arr.length)
        return Project.aggregate([
          {
            $match: {},
          },
        ]);
      return Project.aggregate(arr);
    },
  },

  Mutation: {
    async addProject(_, args, context) {
      const { userId } = context;
      // console.log({ userId })
      // if (!userId) {
      //   throw new Server.AuthenticationError("You must be logged in");
      // }
      console.log(userId);
      const newId = new ObjectId();
      const { title, scope, budget, skills } = args;
      await User.updateOne(
        {
          _id: userId,
        },
        {
          $push: {
            projects: newId,
          },
        }
      );

      const userObj = new Project({
        _id: newId,
        owner: userId,
        title,
        scope,
        budget,
        skills,
        isPublished: false,
      });

      if (userId) {
        try {
          const result = await userObj.save();
          return { ...result._doc };
        } catch (err) {
          console.error(err);
        }
      }
    },

    async deleteProject(_, args, context) {
      const { userId } = context;
      if (!userId) {
        throw new Server.AuthenticationError("You must be logged in");
      }
      console.log(userId);
      const { _id } = args;
      const isProjectOwner = await User.findOne({
        _id: userId,
        projects: {
          $in: ObjectId(_id),
        },
      }).exec();

      if (!isProjectOwner) {
        throw new Server.ForbiddenError(
          "You are not allowed to   do this action"
        );
      }
      await User.updateOne(
        {
          _id: userId,
        },
        {
          $pull: {
            projects: ObjectId(_id),
          },
        }
      );

      await Project.deleteOne({
        _id,
      });
    },

    async updateProject(_, args, context) {
      const {
        project: { _id, title, skills, scope, budget, description },
      } = args;
      const { userId } = context;
      // todo : uncomment this below once auth0 is fixed
      // const isProjectOwner = await Project.findOne({
      //   _id,
      //   owner: userId,
      // }).exec();

      return Project.findOneAndUpdate(
        { _id },
        {
          $set: {
            title,
            skills,
            scope,
            budget,
            description,
          },
        },
        { new: true }
      );
    },

    async updateProjectTitle(_, args, context) {
      const { _id, title } = args;
      const { userId } = context;
      const isProjectOwner = await Project.findOne({
        _id,
        owner: userId,
      }).exec();
      if (isProjectOwner) {
        return Project.findOneAndUpdate(
          { _id },
          {
            $set: {
              title,
            },
          },
          { new: true }
        );
      }
    },

    async updateProjectDescription(_, args, context) {
      const { _id, description } = args;
      const { userId } = context;
      const isProjectOwner = await Project.findOne({
        _id,
        owner: userId,
      }).exec();
      if (isProjectOwner) {
        return Project.findOneAndUpdate(
          { _id },
          {
            $set: {
              description,
            },
          },
          { new: true }
        );
      }
    },

    async updateProjectScope(_, args, context) {
      const { _id, scope } = args;
      const { userId } = context;
      const isProjectOwner = await Project.findOne({
        _id,
        owner: userId,
      }).exec();
      if (isProjectOwner) {
        return Project.findOneAndUpdate(
          { _id },
          {
            $set: {
              scope,
            },
          },
          { new: true }
        );
      }
    },

    async updateProjectBudget(_, args, context) {
      const { _id, budget } = args;
      const { userId } = context;
      const isProjectOwner = await Project.findOne({
        _id,
        owner: userId,
      }).exec();
      if (isProjectOwner) {
        return Project.findOneAndUpdate(
          { _id },
          {
            $set: {
              budget,
            },
          },
          { new: true }
        );
      }
    },

    async updateProjectSkills(_, args, context) {
      const { _id, skills } = args;
      const { userId } = context;
      const isProjectOwner = await Project.findOne({
        _id,
        owner: userId,
      }).exec();
      if (isProjectOwner) {
        return Project.findOneAndUpdate(
          { _id },
          {
            $set: {
              skills,
            },
          },
          { new: true }
        );
      }
    },

    async hireFreelancer(_, args, context) {
      const { projectId, proposalId, freelancerId } = args;

      await Proposal.updateOne(
        {
          _id: proposalId,
        },
        {
          $set: {
            verdict: "hired",
          },
        }
      );

      return Project.updateOne(
        {
          _id: projectId,
        },
        {
          $push: {
            freelancers: ObjectId(freelancerId),
          },
        }
      );
    },
  },
};

export default projectResolver;
