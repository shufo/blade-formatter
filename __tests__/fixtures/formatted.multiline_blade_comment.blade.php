{{-- see issues
this images is example --}}
<style>
    .original-image {
        overflow: hidden;
    }

    .original-image-tag {
        white-space: nowrap;
    }

</style>
<script>
    $('.original-image-input').on('change', handleUpload);

    function handleUpload(event) {
        $('#preview_' + event.target.id).remove();
        {{-- loop --}}
        $(this).parents('.input-group').after('<div id="preview_' + event.target.id + '"></div>');
        var images = event.target.images;

        for (var i = 0, f; f = images[i]; i++) {
            var reader1 = new FileReader();

            reader1.onload = (function(theFile) {
                return function(e) {
                    if (theFile.type.match('image.*')) {
                        var $html = [
                            '<div class="d-container-block mr-1 mt-1"><img class="img-thumbnail" src="',
                            e.target.result, '" title="', escape(theFile.name),
                            '" style="height:100px;" /><div class="small text-muted text-center">',
                            escape(theFile.name), '</div></div>'
                        ].join('');
                        {{-- preview and image --}}
                    } else {
                        var $html = ['<div class="d-container-block mr-1"><span class="small">', escape(
                            theFile.name), '</span></div>'].join('');
                        {{-- any other image --}}
                    }
                    {{-- preview --}}
                    $('#preview_' + event.target.id).append($html);
                };
            })(f);

            reader1.readAsDataURL(f);
        }
        $(this).next('.original-image-tag').html($(this).attr('_text').replace('{n}', images.length));
        {{-- plugin --}}
    }

    // reset
    $('.reset').click(function(event) {
        var id_name = event.target.id.replace('delete_button_', '');
        $(this).parent().prev().children('.original-image-tag').html($(this).parent().prev().children(
            '.original-image-tag').attr('_placeholder'));
        {{-- extension please keep it --}}
        $('.original-image-input').val('');
        $('#preview_' + id_name).remove('');
    })

</script>
