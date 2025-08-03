<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">
        User Profile
      </h1>
      <p class="text-muted-foreground">
        Manage your personal information and preferences
      </p>
    </div>

    <!-- General Information -->
    <Card>
      <CardHeader>
        <CardTitle>General Information</CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex flex-col sm:flex-row items-center gap-6">
          <div class="relative">
            <Avatar class="h-24 w-24 text-3xl">
              <AvatarImage v-if="user?.avatar_url" :src="user.avatar_url" :alt="user.first_name" />
              <AvatarFallback>{{ userInitials }}</AvatarFallback>
            </Avatar>
            <Button size="icon" variant="outline" class="absolute bottom-0 right-0 rounded-full h-8 w-8">
              <Camera class="h-4 w-4" />
              <span class="sr-only">Change photo</span>
            </Button>
          </div>
          <div class="flex-1 space-y-4" v-if="user">
            <div class="grid grid-cols-1 sm:grid-cols-2 layout-card-gap">
              <ProfileField label="First name" :value="user.first_name" @update="user.first_name = $event" />
              <ProfileField label="Last name" :value="user.last_name" @update="user.last_name = $event" />
            </div>
            <ProfileField
              label="Biography"
              :value="user.biography || ''"
              multiline
              @update="user.biography = $event"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Stats -->
    <!-- TODO: Implement user stats functionality -->
    <!-- <div class="grid layout-standard-grid layout-section-gap" v-if="user?.stats">
      <StatCard
        v-for="stat in user.stats"
        :key="stat.label"
        :icon="stat.icon"
        :label="stat.label"
        :value="stat.value"
      />
    </div> -->

    <!-- Contact Information -->
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6" v-if="user">
        <ProfileField
          label="Email"
          :value="user.email || ''"
          type="email"
          @update="user.email = $event"
        />
        <ProfileField
          label="Phone"
          :value="user.phone || ''"
          type="tel"
          @update="user.phone = $event"
        />
        <ProfileField label="Location" :value="user.location || ''" @update="user.location = $event" />
        <ProfileField label="Full address" :value="user.full_address || ''" @update="user.full_address = $event" />
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ProfileField from '@/components/shared/ProfileField.vue';
// import StatCard from '@/components/shared/StatCard.vue';
import { Camera } from 'lucide-vue-next';
import { useUserStore } from '@/stores/user.store';

const userStore = useUserStore();

// Initialize user profile
onMounted(async () => {
  await userStore.loadCurrentUserProfile();
});

// Use current user profile
const user = computed(() => userStore.currentUserProfile);

// Computed property for user initials
const userInitials = computed(() => {
  if (!user.value) return '';
  return `${user.value.first_name[0] || ''}${user.value.last_name[0] || ''}`.toUpperCase();
});

// TODO: Implement edit functionality for profile fields
// TODO: Implement avatar upload functionality

</script>
