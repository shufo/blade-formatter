<div class="justify-center z-50 z-10 z-20 container foo text-left md:text-center">
</div>
@foreach ($items as $item)
   @switch($item->status)
   @case('status')
   // Do something
   @break
   @endswitch
@endforeach

