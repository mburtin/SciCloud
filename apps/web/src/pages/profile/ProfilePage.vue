<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">
        {{ t('profile.title') }}
      </h1>
      <p class="text-muted-foreground">
        {{ t('profile.personalInfo') }}
      </p>
    </div>

    <!-- General Information -->
    <Card>
      <CardHeader>
        <div class="flex justify-between items-center">
          <CardTitle>{{ t('profile.personalInfo') }}</CardTitle>
          <div class="flex gap-2">
            <Button v-if="!isEditing" @click="startEditing" variant="outline" size="sm">
              <Pencil class="h-4 w-4 mr-2" />
              {{ t('common.actions.edit') }}
            </Button>
            <template v-else>
              <Button @click="saveProfile" :disabled="isSaving" size="sm">
                <Check class="h-4 w-4 mr-2" />
                {{ isSaving ? t('common.status.saving') : t('common.actions.save') }}
              </Button>
              <Button @click="cancelEditing" variant="outline" size="sm">
                <X class="h-4 w-4 mr-2" />
                {{ t('common.actions.cancel') }}
              </Button>
            </template>
          </div>
        </div>
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
              <span class="sr-only">{{ t('profile.changeAvatar') }}</span>
            </Button>
          </div>
          <div class="flex-1 space-y-4" v-if="user">
            <div class="grid grid-cols-1 sm:grid-cols-2 layout-card-gap">
              <ProfileField :label="t('profile.firstName')"
                :value="isEditing ? (editedUser.first_name || '') : (user.first_name || '')" :is-editable="isEditing"
                @update="editedUser.first_name = $event" />
              <ProfileField :label="t('profile.lastName')" :value="isEditing ? (editedUser.last_name || '') : (user.last_name || '')"
                :is-editable="isEditing" @update="editedUser.last_name = $event" />
            </div>
            <ProfileField :label="t('profile.bio')" :value="isEditing ? editedUser.biography || '' : user.biography || ''"
              :is-editable="isEditing" multiline @update="editedUser.biography = $event" />
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
        <CardTitle>{{ t('common.labels.contact') }}</CardTitle>
      </CardHeader>
      <CardContent class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6" v-if="user">
        <ProfileField :label="t('profile.email')" :value="user.email || ''" :is-editable="isEditing" :is-disabled="true"
          type="email" />
        <ProfileField :label="t('profile.phone')" :value="isEditing ? editedUser.phone || '' : user.phone || ''"
          :is-editable="isEditing" type="tel" @update="editedUser.phone = $event" />
        <ProfileField :label="t('profile.location')" :value="isEditing ? editedUser.location || '' : user.location || ''"
          :is-editable="isEditing" @update="editedUser.location = $event" />
        <ProfileField :label="t('profile.fullAddress')" :value="isEditing ? editedUser.full_address || '' : user.full_address || ''"
          :is-editable="isEditing" @update="editedUser.full_address = $event" />
      </CardContent>
    </Card>

    <!-- Language Preferences -->
    <Card>
      <CardHeader>
        <CardTitle>{{ t('settings.language') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div>
            <div v-if="!isEditing" class="text-base font-medium">
              {{ localeName }}
            </div>
            <Select v-else :model-value="currentLocale" @update:model-value="setLocale">
              <SelectTrigger class="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="locale in availableLocales" :key="locale.code" :value="locale.code">
                  <div class="flex items-center gap-3">
                    <span class="text-lg leading-none">{{ locale.flag }}</span>
                    <span>{{ locale.name }}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProfileField from '@/components/shared/ProfileField.vue';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation, useLocale } from '@/composables/useLocale';
import { computed, onMounted, ref } from 'vue';
// import StatCard from '@/components/shared/StatCard.vue';
import { useUserStore } from '@/stores/user.store';
import type { User } from '@/types/supabase';
import { Camera, Check, Pencil, X } from 'lucide-vue-next';

const userStore = useUserStore();
const { t } = useTranslation();
const { currentLocale, availableLocales, setLocale, localeName } = useLocale();

// Edit state
const isEditing = ref(false);
const isSaving = ref(false);
const editedUser = ref<Partial<User>>({});

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

// Edit functions
const startEditing = () => {
  if (!user.value) return;

  editedUser.value = {
    first_name: user.value.first_name,
    last_name: user.value.last_name,
    biography: user.value.biography,
    location: user.value.location,
    full_address: user.value.full_address,
    phone: user.value.phone
  };
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
  editedUser.value = {};
};

const saveProfile = async () => {
  if (!user.value || !editedUser.value) return;

  try {
    isSaving.value = true;

    // Separate phone update (auth.users table) from profile update (user_profiles table)
    const { email, phone, ...profileData } = editedUser.value;

    // Update profile data first
    const profileResult = await userStore.updateProfile(user.value.id, profileData);

    if (!profileResult.success) {
      console.error('Failed to update profile:', profileResult.error);
      return;
    }

    // Update phone number if it changed
    if (phone !== user.value.phone) {
      const phoneResult = await userStore.updatePhone(phone || '');
      if (!phoneResult.success) {
        console.error('Failed to update phone:', phoneResult.error);
        return;
      }
    }

    // If both operations succeeded
    isEditing.value = false;
    editedUser.value = {};

    // Reload profile to get updated data
    await userStore.loadCurrentUserProfile();

  } catch (error) {
    console.error('Error saving profile:', error);
  } finally {
    isSaving.value = false;
  }
};

// TODO: Implement avatar upload functionality

</script>
