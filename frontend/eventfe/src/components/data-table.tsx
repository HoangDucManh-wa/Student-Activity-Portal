"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentTable } from "./ui-custom/table/user-table"
import { ClubTable } from "./ui-custom/table/club-table"
import { clubData, studentData } from "@/app/admin/management-account/data"

export function DataTable() {
  return (
    <Tabs defaultValue="student" className="w-full flex-col justify-start gap-6">
      <div className="flex items-center px-4 lg:px-6 justify-between">
        <TabsList >
          <TabsTrigger value="student">Tài khoản</TabsTrigger>
          <TabsTrigger value="club"> Câu lạc bộ </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="student">
        <StudentTable data={studentData} />
      </TabsContent>
      <TabsContent value="club" className="px-4 lg:px-6">
        <ClubTable data={clubData} />
      </TabsContent>
    </Tabs>
  )
}