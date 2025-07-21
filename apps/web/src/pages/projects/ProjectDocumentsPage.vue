<template>
  <div class="space-y-6">
    <!-- Stat Cards -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">
            Total documents
          </CardTitle>
          <FileText class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            3
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">
            Total size
          </CardTitle>
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            33.8 MB
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">
            Recent (7d)
          </CardTitle>
          <Calendar class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            0
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">
            Popular types
          </CardTitle>
          <Tag class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-sm text-muted-foreground">
            report: 1, data: 1
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Documents List -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-semibold">
            Documents
          </h2>
          <p class="text-muted-foreground">
            Manage documents for Water Quality Analysis
          </p>
        </div>
        <Button>
          <Plus class="h-4 w-4 mr-2" />
          Add document
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Documents (3)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="space-y-4">
            <li v-for="doc in documents" :key="doc.name" class="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50">
              <div class="p-3 bg-muted rounded-lg">
                <component :is="doc.icon" class="h-6 w-6 text-muted-foreground" />
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <div class="font-medium">
                    {{ doc.name }} <Badge variant="outline" class="ml-2">
                      {{ doc.type }}
                    </Badge>
                  </div>
                </div>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ doc.description }}
                </p>
                <div class="text-xs text-muted-foreground mt-2 flex items-center gap-4">
                  <div class="flex items-center gap-1">
                    <Calendar class="h-3 w-3" /> {{ doc.uploadDate }}
                  </div>
                  <div class="flex items-center gap-1">
                    <User class="h-3 w-3" /> {{ doc.uploader }}
                  </div>
                  <span>{{ doc.size }}</span>
                </div>
                <div class="mt-2 flex gap-2">
                  <Badge v-for="tag in doc.tags" :key="tag" variant="secondary">
                    {{ tag }}
                  </Badge>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Eye class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Download class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal class="h-4 w-4" />
                </Button>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, TrendingUp, Calendar, Tag, Plus, User, Eye, Download, MoreHorizontal, File, FileType2, FileQuestion } from 'lucide-vue-next';
import { mockProjectDocuments } from '@/data/mocks/project-documents.mock';

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith('.pdf')) return FileType2;
  if (fileName.endsWith('.xlsx')) return File;
  if (fileName.endsWith('.docx')) return File;
  return FileQuestion;
};

// Documents data with computed icons
const documents = ref(
  mockProjectDocuments.map(doc => ({
    ...doc,
    icon: getFileIcon(doc.name)
  }))
)
</script>
