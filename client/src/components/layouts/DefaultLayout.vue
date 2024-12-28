<template>
    <q-layout view="hHh lpR fFf">
  
      <q-header reveal elevated class="bg-primary text-white">
        <q-toolbar>
          <span class="text-h6 q-mx-sm cursor-pointer" @click="router.push('/')">Orakel</span>
          <q-btn stretch flat>Browse</q-btn>

          <q-space />
          <q-separator vertical inset />

          <template v-if="userStore.isLoggedIn">
            Welcome, {{ userStore.user?.username }}
          </template>
          <template v-else>
            <q-btn stretch flat @click="router.push('/login')">Login</q-btn>
          </template>
        </q-toolbar>
      </q-header>
  
      <q-page-container>
        <slot />
      </q-page-container>
  
    </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '../../composables/userStore';

const router = useRouter();
const userStore = useUserStore();
</script>