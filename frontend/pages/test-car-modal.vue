<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Car Image Modal Test</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Example 1: Basic usage -->
        <CarImageModal
          file_path="/uploads/sample-car-1.jpg"
          file_name="sample-car-1.jpg"
          :tags="['sports car', 'red', 'ferrari', 'luxury']"
        >
          <Card class="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <img
              src="/placeholder-image.jpg"
              alt="Sample Car 1"
              class="w-full h-48 object-cover"
            />
            <div class="p-4">
              <h3 class="font-medium text-foreground">Sample Car 1</h3>
              <p class="text-sm text-muted-foreground mt-2">Click to view details</p>
              <div class="mt-3 flex flex-wrap gap-1">
                <Badge variant="secondary" class="text-xs">sports car</Badge>
                <Badge variant="secondary" class="text-xs">red</Badge>
                <Badge variant="secondary" class="text-xs">ferrari</Badge>
              </div>
            </div>
          </Card>
        </CarImageModal>

        <!-- Example 2: Different car -->
        <CarImageModal
          file_path="/uploads/sample-car-2.jpg"
          file_name="sample-car-2.jpg"
          :tags="['sedan', 'blue', 'bmw', 'elegant']"
        >
          <Card class="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <img
              src="/placeholder-image.jpg"
              alt="Sample Car 2"
              class="w-full h-48 object-cover"
            />
            <div class="p-4">
              <h3 class="font-medium text-foreground">Sample Car 2</h3>
              <p class="text-sm text-muted-foreground mt-2">Click to view details</p>
              <div class="mt-3 flex flex-wrap gap-1">
                <Badge variant="secondary" class="text-xs">sedan</Badge>
                <Badge variant="secondary" class="text-xs">blue</Badge>
                <Badge variant="secondary" class="text-xs">bmw</Badge>
              </div>
            </div>
          </Card>
        </CarImageModal>

        <!-- Example 3: No tags -->
        <CarImageModal
          file_path="/uploads/sample-car-3.jpg"
          file_name="sample-car-3.jpg"
          :tags="[]"
        >
          <Card class="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <img
              src="/placeholder-image.jpg"
              alt="Sample Car 3"
              class="w-full h-48 object-cover"
            />
            <div class="p-4">
              <h3 class="font-medium text-foreground">Sample Car 3</h3>
              <p class="text-sm text-muted-foreground mt-2">Click to view details</p>
              <div class="mt-3">
                <Badge variant="outline" class="text-xs">No tags</Badge>
              </div>
            </div>
          </Card>
        </CarImageModal>

        <!-- Example 4: Editable tags (requires imageId) -->
        <CarImageModal
          file_path="/uploads/sample-car-4.jpg"
          file_name="sample-car-4.jpg"
          :tags="['convertible', 'yellow', 'porsche', 'sporty']"
          :image-id="123"
          :allow-edit="true"
        >
          <Card class="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <img
              src="/placeholder-image.jpg"
              alt="Sample Car 4"
              class="w-full h-48 object-cover"
            />
            <div class="p-4">
              <h3 class="font-medium text-foreground">Sample Car 4 (Editable)</h3>
              <p class="text-sm text-muted-foreground mt-2">Click to view and edit tags</p>
              <div class="mt-3 flex flex-wrap gap-1">
                <Badge variant="secondary" class="text-xs">convertible</Badge>
                <Badge variant="secondary" class="text-xs">yellow</Badge>
                <Badge variant="secondary" class="text-xs">porsche</Badge>
                <Badge variant="secondary" class="text-xs">sporty</Badge>
              </div>
            </div>
          </Card>
        </CarImageModal>
      </div>

      <!-- Usage Instructions -->
      <div class="mt-12 bg-white rounded-lg p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Usage Instructions</h2>
        <div class="prose text-gray-600">
          <p>The <code>CarImageModal</code> component accepts the following props:</p>
          <ul class="list-disc list-inside mt-2 space-y-1">
            <li><strong>file_path</strong>: The path to the image file (required)</li>
            <li><strong>file_name</strong>: The name of the image file (required)</li>
            <li><strong>tags</strong>: An array of tags associated with the image (default: [])</li>
            <li><strong>allowEdit</strong>: Whether to allow editing tags (default: false)</li>
            <li><strong>imageId</strong>: The ID of the image for editing tags (required when allowEdit is true)</li>
          </ul>
          <p class="mt-4">The component wraps any content in a slot, and when clicked, opens a modal with:</p>
          <ul class="list-disc list-inside mt-2 space-y-1">
            <li>Full-size car image on the left side</li>
            <li>Car information and tags on the right side</li>
            <li>Download and copy URL functionality</li>
            <li>Tag editing capabilities (when allowEdit is true and imageId is provided)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// This page demonstrates the CarImageModal component usage
</script>
