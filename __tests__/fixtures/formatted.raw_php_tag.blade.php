<section>
    <div>
        <div>
            @if ($foo)
                <?php echo $user; ?><?php
                // This is a comment
                echo 'foobar';
                ?>
            @endif
            @if ($bar)
                <?php
                // This is a comment
                echo json_encode('foobar');
                ?>
            @endif
            @if ($foobar)
                <?php
                // This is a comment
                echo 'foobar';
                ?><?php echo $user->foo['aaa']; ?>
            @endif
        </div>
    </div>
</section>
