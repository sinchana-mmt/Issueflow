-- Replace project-management tables with companies.
ALTER TABLE "Project" DROP CONSTRAINT "Project_createdById_fkey";
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_projectId_fkey";
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_userId_fkey";
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_projectId_fkey";
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_projectId_fkey";

DROP INDEX "Project_status_idx";
DROP INDEX "Issue_projectId_status_rank_idx";
DROP INDEX "Issue_projectId_number_key";
DROP INDEX "Tag_projectId_name_key";

ALTER TABLE "Project" DROP COLUMN "description";
ALTER TABLE "Project" DROP COLUMN "archivedAt";
ALTER TABLE "Project" DROP COLUMN "status";
DROP TYPE "ProjectStatus";

ALTER TABLE "Project" RENAME TO "Company";
ALTER TABLE "ProjectMember" RENAME TO "CompanyMember";
ALTER TABLE "CompanyMember" RENAME COLUMN "projectId" TO "companyId";
ALTER TABLE "Issue" RENAME COLUMN "projectId" TO "companyId";
ALTER TABLE "Tag" RENAME COLUMN "projectId" TO "companyId";

ALTER INDEX "Project_pkey" RENAME TO "Company_pkey";
ALTER INDEX "Project_key_key" RENAME TO "Company_key_key";
ALTER INDEX "ProjectMember_pkey" RENAME TO "CompanyMember_pkey";
ALTER INDEX "ProjectMember_userId_idx" RENAME TO "CompanyMember_userId_idx";

ALTER TABLE "CompanyMember" ADD COLUMN "delegated" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Company_name_idx" ON "Company"("name");
CREATE INDEX "Issue_companyId_status_rank_idx" ON "Issue"("companyId", "status", "rank");
CREATE UNIQUE INDEX "Issue_companyId_number_key" ON "Issue"("companyId", "number");
CREATE UNIQUE INDEX "Tag_companyId_name_key" ON "Tag"("companyId", "name");

ALTER TABLE "Company" ADD CONSTRAINT "Company_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
