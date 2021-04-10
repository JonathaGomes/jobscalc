const Job = require("../model/Job");
const Profile = require("../model/Profile");
const JobUtils = require("../utils/JobUtils");

module.exports = {
  index(request, response) {
    const jobs = Job.get();
    const profile = Profile.get();

    const statusCount = {
      progress: 0,
      done: 0,
      total: jobs.length,
    };

    let jobTotalHours = 0;

    const updatedJobs = jobs.map((job) => {
      // Cálculo do restante de dias do job
      const remaining = JobUtils.remainingDays(job);

      // se os dias restantes chegarem a 0
      const status = remaining <= 0 ? "done" : "progress";

      statusCount[status] += 1;

      jobTotalHours =
        status === "progress"
          ? (jobTotalHours += Number(job["daily-hours"]))
          : jobTotalHours;

      return {
        ...job,
        remaining,
        status,
        budget: JobUtils.calculateBudget(job, profile["value-hour"]),
      };
    });

    const freeHours = profile["hours-per-day"] - jobTotalHours;

    return response.render("index", {
      jobs: updatedJobs,
      profile: profile,
      statusCount,
      freeHours,
    });
  },
};