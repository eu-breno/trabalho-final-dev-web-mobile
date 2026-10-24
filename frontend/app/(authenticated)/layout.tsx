import { AuthenticatedAppLayout } from "@/components/navigation/app-page-layout"

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AuthenticatedAppLayout>{children}</AuthenticatedAppLayout>
}
