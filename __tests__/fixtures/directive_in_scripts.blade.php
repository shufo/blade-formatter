<body>
    @php
        if ($user) {
        $foo = ['aaa', 'bbb', 'ccc'];
          foreach ($users as $user) {
                echo $user->id;
            }
        }
    @endphp
</body>
<script>
    @if ($user)
      @if ($body)
        let myvalue = 1;
        @endif
    @else
    let foo = 0;
    @endif

    const a = 0;


    @foreach ($users as $user)
      let b = 1;
    @endforeach

    var rows = prompt("How many rows for your multiplication table?");
    var cols = prompt("How many columns for your multiplication table?");
    if (rows == "" || rows == null)
    rows = 10;
    if (cols == "" || cols == null)
    cols = 10;

    @if ($user)
    createTable(rows, cols);
@else
    console.log(cols);
    @endif

    function createTable(rows, cols) {
      var j = 1;
        var output = "<table border='1' width='500' cellspacing='0' cellpadding='5'>";
        for (i = 1; i <= rows; i++) {
        output = output + "<tr>";
        while (j <= cols) {
          output = output + "<td>" + i * j +
                 "</td>";
                j = j + 1;
            }
            output = output + "</tr>";
            j = 1;
      }
        output = output + "</table>";
        document.write(output);
    }

</script>

