<script lang="ts" setup>
  
  import { useToast } from '~/components/ui/toast';

  interface Props {
    roleId: string
  }

  const props = defineProps<Props>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Define permission interfaces
  interface DashboardPermission {
    dashboard_posts_view: boolean
    dashboard_posts_create: boolean
    dashboard_posts_update: boolean
    dashboard_posts_delete: boolean
    dashboard_uploads_view: boolean
    dashboard_uploads_create: boolean
    dashboard_uploads_update: boolean
    dashboard_uploads_delete: boolean
    dashboard_activity_view: boolean
  }

  interface AccountsPermission {
    accounts_users_view: boolean
    accounts_users_create: boolean
    accounts_users_update: boolean
    accounts_users_delete: boolean
    accounts_roles_view: boolean
    accounts_roles_create: boolean
    accounts_roles_update: boolean
    accounts_roles_delete: boolean
    accounts_permissions_view: boolean
    accounts_permissions_create: boolean
    accounts_permissions_update: boolean
    accounts_permissions_delete: boolean
  }

  interface ProfilePermission {
    profile_wall_view: boolean
    profile_wall_create: boolean
    profile_wall_update: boolean
    profile_wall_delete: boolean
    profile_activity_view: boolean
    profile_settings_view: boolean
    profile_settings_update: boolean
  }

  interface ApplicationPermissions {
    dashboard_permission: DashboardPermission
    accounts_permission: AccountsPermission
    profile_permission: ProfilePermission
  }

  // Create default permissions object
  const getDefaultPermissions = (): ApplicationPermissions => ({
    dashboard_permission: {
      dashboard_posts_view: false,
      dashboard_posts_create: false,
      dashboard_posts_update: false,
      dashboard_posts_delete: false,
      dashboard_uploads_view: false,
      dashboard_uploads_create: false,
      dashboard_uploads_update: false,
      dashboard_uploads_delete: false,
      dashboard_activity_view: false
    },
    accounts_permission: {
      accounts_users_view: false,
      accounts_users_create: false,
      accounts_users_update: false,
      accounts_users_delete: false,
      accounts_roles_view: false,
      accounts_roles_create: false,
      accounts_roles_update: false,
      accounts_roles_delete: false,
      accounts_permissions_view: false,
      accounts_permissions_create: false,
      accounts_permissions_update: false,
      accounts_permissions_delete: false
    },
    profile_permission: {
      profile_wall_view: false,
      profile_wall_create: false,
      profile_wall_update: false,
      profile_wall_delete: false,
      profile_activity_view: false,
      profile_settings_view: false,
      profile_settings_update: false
    }
  });

  const new_permission = reactive<ApplicationPermissions>(getDefaultPermissions());
  const currentRoleTitle = ref("");
  const currentRoleId = ref(props.roleId);

  // Query for permissions data
  const { data: queryData, isLoading, error } = useQuery({
    queryKey: computed(() => [`permissions-display-${currentRoleId.value}`]),
    queryFn: async () => {
      const response = await fetch(`/api/account/accounts/permissions/${currentRoleId.value}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
    enabled: computed(() => !!currentRoleId.value)
  });

  // Update roleId and invalidate queries when props change
  watch(() => props.roleId, (newRoleId) => {
    currentRoleId.value = newRoleId;
    queryClient.invalidateQueries({ 
      queryKey: [`permissions-display-${currentRoleId.value}`] 
    });
  });

  // Update permissions when data is loaded
  watch(() => queryData.value, (newData) => {
    
    currentRoleTitle.value = newData?.title || "";

    if (newData?.permissions) {
      Object.keys(newData.permissions).forEach(section => {
        const key = section as keyof ApplicationPermissions;
        new_permission[key] = { ...newData.permissions[key as keyof typeof newData.permissions] };
      });
      console.log('Permissions updated from server data');
    } else {
      // Reset the reactive object using defaults
     const defaults = getDefaultPermissions();
     Object.assign(new_permission, defaults); // Copies properties from defaults onto new_permission
     console.log('Reset to default permissions (no data from server)');
    }
  }, { immediate: true });

  // Update role permissions
  const { mutate: updateRolePermission, isPending: isPermissionUpdating } = useMutation({
    mutationFn: async (payload: ApplicationPermissions) => {
      return await $fetch(`/api/account/accounts/permissions/${currentRoleId.value}`, {
        method: 'PATCH',
        body: payload,
      });
    },
    onSuccess: () => {

      toast({
        title: 'Permission Update',
        description: 'Permission has been updated successfully.',
      });
      
    },
    onError: (error: any) => {
      console.error('Permission update error:', error);
    }
  });

  const handleUpdate = () => {
    updateRolePermission(new_permission);
  }

  const emit = defineEmits<{
    (e: 'onClose', close: boolean): void
  }>();

</script>

<template>

  <section class="pl-4 mb-2">
    <div class="flex items-center justify-between" v-show="isPermissionUpdating === false && isLoading === false">

      <div class="flex items-center space-x-5">
        <Button size="icon" class="text-sm font-semibold bg-purple-400 hover:bg-purple-400" @click="emit('onClose', false)">
          <Icon name="lucide:panel-left-close" class="w-5 h-5" />
        </Button>

        <div class="flex flex-col">
          <h2 class="text-sm font-semibold tracking-tighter"> {{ currentRoleTitle }} Permissions</h2>
          <p class="max-w-3xl text-muted-foreground md:text-sm"> Modify {{ currentRoleTitle.toLowerCase() }} accounts permissions.  </p>
        </div>
      </div>

      <Button size="icon" class="text-sm font-semibold bg-purple-400 hover:bg-purple-400" @click="handleUpdate">
        <Icon name="lucide:save" class="w-5 h-5" />
      </Button>
    </div>

    <div class="flex items-center justify-between animate-pulse" v-show="isPermissionUpdating || isLoading">
      <div class="flex items-center space-x-5">
        <Button size="icon" class="bg-gray-200 hover:bg-purple-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><!-- Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE --><rect width="7.33" height="7.33" x="1" y="1" fill="currentColor"><animate id="svgSpinnersBlocksWave0" attributeName="x" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/><animate attributeName="y" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/><animate attributeName="width" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/><animate attributeName="height" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect width="7.33" height="7.33" x="8.33" y="1" fill="currentColor"><animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/><animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/><animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/><animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect width="7.33" height="7.33" x="1" y="8.33" fill="currentColor"><animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/><animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/><animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/><animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect width="7.33" height="7.33" x="15.66" y="1" fill="currentColor"><animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/><animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/><animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/><animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect width="7.33" height="7.33" x="8.33" y="8.33" fill="currentColor"><animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/><animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/><animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/><animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect width="7.33" height="7.33" x="1" y="15.66" fill="currentColor"><animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/><animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/><animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/><animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect width="7.33" height="7.33" x="15.66" y="8.33" fill="currentColor"><animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/><animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/><animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/><animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect width="7.33" height="7.33" x="8.33" y="15.66" fill="currentColor"><animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/><animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/><animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/><animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect width="7.33" height="7.33" x="15.66" y="15.66" fill="currentColor"><animate id="svgSpinnersBlocksWave1" attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/><animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/><animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/><animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/></rect></svg>
        </Button> 

        <div class="flex flex-col space-y-1">
          <div class="w-20 h-5 bg-gray-200 rounded-sm"></div>
          <div class="w-64 h-3 bg-gray-200 rounded-sm"></div>
        </div>
      </div>

      <Button size="icon" class="bg-gray-200 hover:bg-purple-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><!-- Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE --><rect width="7.33" height="7.33" x="1" y="1" fill="currentColor"><animate id="svgSpinnersBlocksWave0" attributeName="x" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/><animate attributeName="y" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="1;4;1"/><animate attributeName="width" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/><animate attributeName="height" begin="0;svgSpinnersBlocksWave1.end+0.2s" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect width="7.33" height="7.33" x="8.33" y="1" fill="currentColor"><animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/><animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/><animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/><animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect width="7.33" height="7.33" x="1" y="8.33" fill="currentColor"><animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="1;4;1"/><animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="8.33;11.33;8.33"/><animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/><animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.1s" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect width="7.33" height="7.33" x="15.66" y="1" fill="currentColor"><animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/><animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/><animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/><animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect width="7.33" height="7.33" x="8.33" y="8.33" fill="currentColor"><animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/><animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="8.33;11.33;8.33"/><animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/><animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect width="7.33" height="7.33" x="1" y="15.66" fill="currentColor"><animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="1;4;1"/><animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="15.66;18.66;15.66"/><animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/><animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.2s" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect width="7.33" height="7.33" x="15.66" y="8.33" fill="currentColor"><animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/><animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/><animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/><animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect width="7.33" height="7.33" x="8.33" y="15.66" fill="currentColor"><animate attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="8.33;11.33;8.33"/><animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="15.66;18.66;15.66"/><animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/><animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.3s" dur="0.6s" values="7.33;1.33;7.33"/></rect><rect width="7.33" height="7.33" x="15.66" y="15.66" fill="currentColor"><animate id="svgSpinnersBlocksWave1" attributeName="x" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/><animate attributeName="y" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="15.66;18.66;15.66"/><animate attributeName="width" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/><animate attributeName="height" begin="svgSpinnersBlocksWave0.begin+0.4s" dur="0.6s" values="7.33;1.33;7.33"/></rect></svg>
      </Button> 
    </div>
  </section>

  <div class="flex flex-wrap gap-4 pl-4" v-show="isPermissionUpdating === false && isLoading === false">
    
    <div class="p-4 bg-white border border-gray-100 rounded-md shadow-sm">
      
      <div class="space-y-1">
        <h4 class="text-sm font-medium leading-none">
          Dashboard
        </h4>
        <p class="text-sm text-muted-foreground">
         Set {{ currentRoleTitle.toLowerCase() }} dashboard module access.
        </p>
      </div>
      
      <Separator class="my-4" label="Posts" />
      <div class="flex items-center h-5 space-x-4 text-sm">

        <div class="flex items-center space-x-2">
          <Switch id="dashboard-posts-view" v-model="new_permission.dashboard_permission.dashboard_posts_view" class="scale-75" />
          <Label for="dashboard-posts-view" class="text-xs font-medium leading-none">View</Label>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-2">
          <Switch id="dashboard-posts-create" v-model="new_permission.dashboard_permission.dashboard_posts_create" class="scale-75" />
          <Label for="dashboard-posts-create" class="text-xs font-medium leading-none">Create</Label>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-2">
          <Switch id="dashboard-posts-update" v-model="new_permission.dashboard_permission.dashboard_posts_update" class="scale-75" />
          <Label for="dashboard-posts-update" class="text-xs font-medium leading-none">Update</Label>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-2">
          <Switch id="dashboard-posts-delete" v-model="new_permission.dashboard_permission.dashboard_posts_delete" class="scale-75" />
          <Label for="dashboard-posts-delete" class="text-xs font-medium leading-none">Delete</Label>
        </div>

      </div>

      <Separator class="my-4" label="Uploads" />
      <div class="flex items-center h-5 space-x-4 text-sm">

        <div class="flex items-center space-x-2">
          <Switch id="dashboard-uploads-view" v-model="new_permission.dashboard_permission.dashboard_uploads_view" class="scale-75" />
          <Label for="dashboard-uploads-view" class="text-xs font-medium leading-none">View</Label>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-2">
          <Switch id="dashboard-uploads-create" v-model="new_permission.dashboard_permission.dashboard_uploads_create" class="scale-75" />
          <Label for="dashboard-uploads-create" class="text-xs font-medium leading-none">Create</Label>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-2">
          <Switch id="dashboard-uploads-update" v-model="new_permission.dashboard_permission.dashboard_uploads_update" class="scale-75" />
          <Label for="dashboard-uploads-update" class="text-xs font-medium leading-none">Update</Label>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-2">
          <Switch id="dashboard-uploads-delete" v-model="new_permission.dashboard_permission.dashboard_uploads_delete" class="scale-75" />
          <Label for="dashboard-uploads-delete" class="text-xs font-medium leading-none">Delete</Label>
        </div>

      </div>

      <Separator class="my-4" label="Activities" />
      <div class="flex items-center h-5 space-x-4 text-sm">

        <div class="flex items-center space-x-2">
          <Switch id="dashboard-activity-view" v-model="new_permission.dashboard_permission.dashboard_activity_view" class="scale-75" />
          <Label for="dashboard-activity-view" class="text-xs font-medium leading-none">View</Label>
        </div>

      </div>

    </div>

    <div class="p-4 bg-white border border-gray-100 rounded-md shadow-sm">

      <div class="space-y-1">
        <h4 class="text-sm font-medium leading-none">
          Accounts
        </h4>
        <p class="text-sm text-muted-foreground">
          Set {{ currentRoleTitle.toLowerCase() }} accounts module access.
        </p>
      </div>
      
      <Separator class="my-4" label="Users" />
      <div class="flex items-center h-5 space-x-4 text-sm">

        <div class="flex items-center space-x-2">
          <Switch id="accounts-users-view" v-model="new_permission.accounts_permission.accounts_users_view" class="scale-75" />
          <Label for="accounts-users-view" class="text-xs font-medium leading-none">View</Label>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-2">
          <Switch id="accounts-users-create" v-model="new_permission.accounts_permission.accounts_users_create" class="scale-75" />
          <Label for="accounts-users-create" class="text-xs font-medium leading-none">Create</Label>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-2">
          <Switch id="accounts-users-update" v-model="new_permission.accounts_permission.accounts_users_update" class="scale-75" />
          <Label for="accounts-users-update" class="text-xs font-medium leading-none">Update</Label>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-2">
          <Switch id="accounts-users-delete" v-model="new_permission.accounts_permission.accounts_users_delete" class="scale-75" />
          <Label for="accounts-users-delete" class="text-xs font-medium leading-none">Delete</Label>
        </div>

      </div>

      <Separator class="my-4" label="Roles" />
      <div class="flex items-center h-5 space-x-4 text-sm">

        <div class="flex items-center space-x-2">
          <Switch id="accounts-roles-view" v-model="new_permission.accounts_permission.accounts_roles_view" class="scale-75" />
          <Label for="accounts-roles-view" class="text-xs font-medium leading-none">View</Label>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-2">
          <Switch id="accounts-roles-create" v-model="new_permission.accounts_permission.accounts_roles_create" class="scale-75" />
          <Label for="accounts-roles-create" class="text-xs font-medium leading-none">Create</Label>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-2">
          <Switch id="accounts-roles-update"  v-model="new_permission.accounts_permission.accounts_roles_update" class="scale-75" />
          <Label for="accounts-roles-update" class="text-xs font-medium leading-none">Update</Label>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-2">
          <Switch id="accounts-roles-delete"  v-model="new_permission.accounts_permission.accounts_roles_delete" class="scale-75" />
          <Label for="accounts-roles-delete" class="text-xs font-medium leading-none">Delete</Label>
        </div>

      </div>

      <Separator class="my-4" label="Permissions" />
      <div class="flex items-center h-5 space-x-4 text-sm">

        <div class="flex items-center space-x-2">
          <Switch id="accounts-permissions-view" v-model="new_permission.accounts_permission.accounts_permissions_view" class="scale-75" />
          <Label for="accounts-permissions-view" class="text-xs font-medium leading-none">View</Label>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-2">
          <Switch id="accounts-permissions-create" v-model="new_permission.accounts_permission.accounts_permissions_create" class="scale-75" />
          <Label for="accounts-permissions-create" class="text-xs font-medium leading-none">Create</Label>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-2">
          <Switch id="accounts-permissions-update" v-model="new_permission.accounts_permission.accounts_permissions_update" class="scale-75" />
          <Label for="accounts-permissions-update" class="text-xs font-medium leading-none">Update</Label>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-2">
          <Switch id="accounts-permissions-delete" v-model="new_permission.accounts_permission.accounts_permissions_delete" class="scale-75" />
          <Label for="accounts-permissions-delete" class="text-xs font-medium leading-none">Delete</Label>
        </div>

      </div>
    </div>

    <div class="p-4 bg-white border border-gray-100 rounded-md shadow-sm">
      
      <div class="space-y-1">
        <h4 class="text-sm font-medium leading-none">
          Profile
        </h4>
        <p class="text-sm text-muted-foreground">
          Set {{ currentRoleTitle.toLowerCase() }} profile module access.
        </p>
      </div>
      
      <Separator class="my-4" label="Wall" />
      <div class="flex items-center h-5 space-x-4 text-sm">

        <div class="flex items-center space-x-2">
          <Switch id="profile-wall-view" v-model="new_permission.profile_permission.profile_wall_view" class="scale-75" />
          <Label for="profile-wall-view" class="text-xs font-medium leading-none">View</Label>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-2">
          <Switch id="profile-wall-create" v-model="new_permission.profile_permission.profile_wall_create" class="scale-75" />
          <Label for="profile-wall-create" class="text-xs font-medium leading-none">Create</Label>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-2">
          <Switch id="profile-wall-update" v-model="new_permission.profile_permission.profile_wall_update" class="scale-75" />
          <Label for="profile-wall-update" class="text-xs font-medium leading-none">Update</Label>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-2">
          <Switch id="profile-wall-delete" v-model="new_permission.profile_permission.profile_wall_delete" class="scale-75" />
          <Label for="profile-wall-delete" class="text-xs font-medium leading-none">Delete</Label>
        </div>

      </div>

      <Separator class="my-4" label="Activity" />
      <div class="flex items-center h-5 space-x-4 text-sm">

        <div class="flex items-center space-x-2">
          <Switch id="profile-activity-view" v-model="new_permission.profile_permission.profile_activity_view" class="scale-75" />
          <Label for="profile-activity-view" class="text-xs font-medium leading-none">View</Label>
        </div>

        <Separator orientation="vertical" />
      
      </div>

      <Separator class="my-4" label="Settings" />
      <div class="flex items-center h-5 space-x-4 text-sm">

        <div class="flex items-center space-x-2">
          <Switch id="profile-Settings-view" v-model="new_permission.profile_permission.profile_settings_view" class="scale-75" />
          <Label for="profile-Settings-view" class="text-xs font-medium leading-none">View</Label>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-2">
          <Switch id="profile-Settings-update" v-model="new_permission.profile_permission.profile_settings_update" class="scale-75" />
          <Label for="profile-Settings-update" class="text-xs font-medium leading-none">Update</Label>
        </div>

        <Separator orientation="vertical" />

      </div>
    </div>

    <div class="p-4 bg-white border border-gray-100 rounded-md shadow-sm">
      <div class="space-y-1">
        <h4 class="text-sm font-medium leading-none">
          Settings
        </h4>
        <p class="text-sm text-muted-foreground">
          Set {{ currentRoleTitle.toLowerCase() }} settings module access.
        </p>
      </div>
      <Separator class="my-4" label="Or" />
      <div class="flex items-center h-5 space-x-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>

    <div class="p-4 bg-white border border-gray-100 rounded-md shadow-sm">
      <div class="space-y-1">
        <h4 class="text-sm font-medium leading-none">
          Contents
        </h4>
        <p class="text-sm text-muted-foreground">
          Set {{ currentRoleTitle.toLowerCase() }} contents module access.
        </p>
      </div>
      <Separator class="my-4" label="Or" />
      <div class="flex items-center h-5 space-x-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>

  </div>

  <div class="flex flex-wrap gap-4 pl-4" v-show="isPermissionUpdating || isLoading">
    <div class="p-4 bg-white border border-gray-100 rounded-md shadow-sm animate-pulse" v-for="i in 5" :key="i">
      
      <div class="space-y-1">
        <div class="w-16 h-5 bg-gray-200 rounded-sm"></div>
        <div class="w-64 h-3 bg-gray-200 rounded-sm"></div>
      </div>
      
      <Separator class="my-4" />
      <div class="flex items-center h-5 space-x-4 text-sm">

        <div class="flex items-center space-x-1">
          <div class="w-5 h-5 bg-gray-200 rounded-sm"></div>
          <div class="w-10 h-5 bg-gray-200 rounded-sm"></div>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-1">
          <div class="w-5 h-5 bg-gray-200 rounded-sm"></div>
          <div class="w-10 h-5 bg-gray-200 rounded-sm"></div>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-1">
          <div class="w-5 h-5 bg-gray-200 rounded-sm"></div>
          <div class="w-10 h-5 bg-gray-200 rounded-sm"></div>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-1">
          <div class="w-5 h-5 bg-gray-200 rounded-sm"></div>
          <div class="w-10 h-5 bg-gray-200 rounded-sm"></div>
        </div>

      </div>

      <Separator class="my-4" />
      <div class="flex items-center h-5 space-x-4 text-sm">

        <div class="flex items-center space-x-1">
          <div class="w-5 h-5 bg-gray-200 rounded-sm"></div>
          <div class="w-10 h-5 bg-gray-200 rounded-sm"></div>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-1">
          <div class="w-5 h-5 bg-gray-200 rounded-sm"></div>
          <div class="w-10 h-5 bg-gray-200 rounded-sm"></div>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-1">
          <div class="w-5 h-5 bg-gray-200 rounded-sm"></div>
          <div class="w-10 h-5 bg-gray-200 rounded-sm"></div>
        </div>

        <Separator orientation="vertical" />
        
        <div class="flex items-center space-x-1">
          <div class="w-5 h-5 bg-gray-200 rounded-sm"></div>
          <div class="w-10 h-5 bg-gray-200 rounded-sm"></div>
        </div>

      </div>

      <Separator class="my-4"/>
      <div class="flex items-center h-5 space-x-4 text-sm">

        <div class="flex items-center space-x-1">
          <div class="w-5 h-5 bg-gray-200 rounded-sm"></div>
          <div class="w-10 h-5 bg-gray-200 rounded-sm"></div>
        </div>

      </div>

    </div>
  </div>
</template>

