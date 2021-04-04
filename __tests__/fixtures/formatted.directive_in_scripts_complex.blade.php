@push('scripts')
    <script src="{{ asset('backend/plugins/dropzone/dropzone.min.js') }}"></script>
    <script>
        Dropzone.options.gallery = {
            url: "...",
            previewTemplate: $("#preview-template").html(),
            dictDefaultMessage: "Drop files here or click to select",
            addRemoveLinks: true,
            uploadMultiple: true,
            maxFilesize: 2,
            filesizeBase: 1024,
            acceptedFiles: "image/jpg,image/jpeg,image/png",
            init: function() {
                this.renderExistingServerFiles = function(files, fileUrls, response) {
                    for (const file in files) {
                        if (Object.hasOwnProperty.call(files, file)) {
                            const element = files[file];

                            this.files.push(element);
                            this.displayExistingFile(element, fileUrls[file], null, null, true);
                            this.emit("processing", element);
                            this.emit("complete", element);
                        }
                    }
                    this.emit("successmultiple", files, response, false);
                }

                @isset($item->images)
                    let files = [];
                    let fileUrls = [];
                    let response = { status:"success", fileHashes: [], imageIds: []};
                    @foreach ($item->images as $image)
                        @php
                            $imageUrl = asset('img/' . $image->image_hash);
                            $imagePath = public_path('img/' . $image->image_hash);
                            $imageMime = File::mimeType($imagePath);
                            $imageSize = File::size($imagePath);
                            $imageName = File::name($imagePath);
                        @endphp
                    
                        files.push({
                        processing: true,
                        accepted: true,
                        name: "{{ $imageName }}",
                        size: {{ $imageSize }},
                        type: '{{ $imageMime }}',
                        status: Dropzone.SUCCESS,});
                    
                        fileUrls.push("{{ $imageUrl }}")
                        response.fileHashes.push("{{ $image->image_hash }}")
                        response.imageIds.push("{{ $image->id }}")
                    @endforeach
                    this.renderExistingServerFiles(files, fileUrls, response);
                @endisset
            },
        }

    </script>
@endpush
