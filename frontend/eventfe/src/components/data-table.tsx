"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentTable } from "./ui-custom/table/user-table"
import { ClubTable } from "./ui-custom/table/club-table"
import { ThirdPartyTable } from "./ui-custom/table/third-party-table"
import { UniversityTable } from "./ui-custom/table/university-table"
import { envConfig } from "@/configs/env.config"
import { http } from "@/configs/http.comfig"
import React from "react"

export function DataTable() {
  const [users, setUsers] = React.useState<any[]>([])
  const [clubs, setClubs] = React.useState<any[]>([])
  const [thirdParties, setThirdParties] = React.useState<any[]>([])
  const [emailType, setEmailType] = React.useState<string>("")

  async function fetchUsers() {
    const params = new URLSearchParams({ limit: "100" })
    if (emailType) params.set("emailType", emailType)
    const res = await http.get<any>(`${envConfig.NEXT_PUBLIC_API_URL}/admin/users?${params}`) as any
    if (res?.success && res?.data?.data) {
      setUsers(res.data.data.map((u: any) => ({ ...u, id: u.userId })))
    }
  }

  async function fetchOrgs() {
    const res = await http.get<any>(`${envConfig.NEXT_PUBLIC_API_URL}/admin/organizations?limit=100`) as any
    if (res?.success && res?.data?.data) {
      const all = res.data.data.map((o: any) => ({ ...o, id: o.organizationId }))
      setClubs(all.filter((o: any) => o.organizationType === "club"))
      setThirdParties(all.filter((o: any) => o.organizationType !== "club"))
    }
  }

  React.useEffect(() => {
    fetchUsers()
    fetchOrgs()
  }, [emailType])

  return (
    <Tabs defaultValue="student" className="w-full flex-col justify-start gap-6">
      <div className="flex items-center px-4 lg:px-6 justify-between">
        <TabsList>
          <TabsTrigger value="student">Tài khoản</TabsTrigger>
          <TabsTrigger value="student_university">Sinh viên trường</TabsTrigger>
          <TabsTrigger value="club">CLB</TabsTrigger>
          <TabsTrigger value="third_party">Bên thứ 3</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="student">
        {/* Email type filter bar */}
        <div className="flex items-center gap-3 px-4 lg:px-6 mb-4">
          <span className="text-sm text-muted-foreground">Lọc email:</span>
          <select
            value={emailType}
            onChange={(e) => setEmailType(e.target.value)}
            className="border rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Tất cả</option>
            <option value="student">Email .edu (sinh viên)</option>
            <option value="external">Email bên ngoài</option>
          </select>
        </div>
        <StudentTable data={users} onRefresh={fetchUsers} />
      </TabsContent>
      <TabsContent value="student_university">
        <UniversityTable onRefresh={fetchUsers} />
      </TabsContent>
      <TabsContent value="club" className="px-4 lg:px-6">
        <ClubTable data={clubs} onRefresh={fetchOrgs} />
      </TabsContent>
      <TabsContent value="third_party" className="px-4 lg:px-6">
        <ThirdPartyTable data={thirdParties} onRefresh={fetchOrgs} />
      </TabsContent>
    </Tabs>
  )
}
