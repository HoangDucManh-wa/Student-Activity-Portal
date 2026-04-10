import {
  Card,
  CardHeader,
} from "@/components/ui/card"
import { LoginForm } from "./loginForm"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RegisterForm } from "./registerForm"
import { OrgLoginForm } from "./loginOrgForm"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { getAllUniversity } from "@/services/university.service"

export default async function AuthPage() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["universities", { page: 1, size: -1, query: '', sort: "1" }],
    queryFn: () => getAllUniversity({ size: -1 })
  })
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Card className="w-full sm:max-w-md mx-auto mt-[50px]">
        <Tabs defaultValue="login">
          <CardHeader>
            <Image src="/logo.png" alt="Logo" width={160} height={160} className="mx-auto mb-[10px]" />
            <TabsList variant="line" className="mx-auto">
              <TabsTrigger value="login" className="text-[20px] w-[113px]">Login</TabsTrigger>
              <TabsTrigger value="login-org" className="text-[20px] w-[113px]">Tổ chức / CLB</TabsTrigger>
              <TabsTrigger value="signup" className="text-[20px] w-[113px]">Sign up</TabsTrigger>
            </TabsList>
          </CardHeader>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="login-org">
            <OrgLoginForm />
          </TabsContent>
          <TabsContent value="signup">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </Card>
    </HydrationBoundary>
  )
}
