import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const roles = await prisma.role.findMany({
    select: {
      title: true
    },
    orderBy: {
      position: 'asc'
    }
  });

  // Transform the roles into the format needed for the DataTableFacetedFilter
  const formattedRoles = roles.map(role => ({
    value: role.title,  // Use ID as the value for filtering
    label: role.title,
    icon: 'lucide:circle-user'  // Just send the icon name as a string
  }));

  return formattedRoles;
});