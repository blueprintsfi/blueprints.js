<link rel="stylesheet" href="./grammar.css" />
<script type="module" src="./grammar.ts"></script>
    
This page contains the formal definition of the string representation of tokens
in the Blueprints ecosystem. It does not define the set of on-chain actions that
can be performed on them. These are defined by the [smart contracts][core].
Instead, it defines a set of valid tokens, as well as their external token ids
and wei amounts.

## Context-free grammar 

For a set $A$, we define $A^{*}$ as the set of finite sequences with elements from
$A$. For finite sequences $w$, $v$, we define $w\ v$ as the concatenation of
these sequences.

A context-free grammar is defined by a finite set of terminal symbols $A$, a
finite set of non-terminal symbols $N$, a goal symbol $S \in N$, and a set of
productions $\alpha \subseteq N \times (A \cup N)^{*}$.

<div class="def" id="def-token">
    <div>
        <a href="#def-token"><em>Token</em></a> :
    </div>
    <div class="prod">
        <a href="#def-token-amount"><em>Token amount</em></a>
        <code>&nbsp;</code>
        <a href="#def-token-construction"><em>Token construction</em></a>
    </div>
</div>

<div class="def" id="def-token-amount">
    <div>
        <a href="#def-token-amount"><em>Token amount</em></a> :
    </div>
    <div class="prod">
        <a href="#def-amount-integer-part"><em>Amount integer part</em></a>
        <a href="#def-amount-fractional-part"><em>Amount fractional part</em></a>
    </div>
    <div class="prod">
        <code>~</code>
        <a href="#def-amount-integer-part"><em>Amount integer part</em></a>
        <a href="#def-amount-fractional-part"><em>Amount fractional part</em></a>
    </div>
</div>

<div class="def" id="def-amount-integer-part">
    <div>
        <a href="#def-amount-integer-part"><em>Amount integer part</em></a> :
    </div>
    <div class="prod">
        <code>0</code>
    </div>
    <div class="prod">
        <a href="#def-integer-first-digit"><em>Integer first digit</em></a>
        <a href="#def-integer-digits"><em>Integer digits</em></a>
    </div>
</div>

<div class="def" id="def-amount-fractional-part">
    <div>
        <a href="#def-amount-fractional-part"><em>Amount fractional part</em></a> :
    </div>
    <div class="prod">
        <span>$\varepsilon$</span>
    </div>
    <div class="prod">
        <code>.</code>
        <a href="#def-integer-digit"><em>Integer digit</em></a>
        <a href="#def-integer-digits"><em>Integer digits</em></a>
    </div>
</div>

<div class="def" id="def-token-construction">
    <div>
        <a href="#def-token-construction"><em>Token construction</em></a> :
    </div>
    <div class="prod" data-rule="native-token">
        <code>NativeToken&lt;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod" data-rule="erc20">
        <code>ERC20&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod" data-rule="basket">
        <code>Basket&lt;</code>
        <a href="#def-nonempty-token-array"><em>Non-empty token array</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>ComposablePrediction&lt;</code>
        <a href="#def-token"><em>Token</em></a>
        <code>,&nbsp;</code>
        <a href="#def-constraint-array"><em>Constraint array</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>WithMetadata&lt;</code>
        <a href="#def-token"><em>Token</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>UnsupportedBlueprint&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>UnknownBlueprint&lt;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

<div class="def" id="def-constraint-array">
    <div>
        <a href="#def-constraint-array"><em>Constraint array</em></a> :
    </div>
    <div class="prod">
        <code>[]</code>
    </div>
    <div class="prod">
        <code>[</code>
        <a href="#def-constraint"><em>Constraint</em></a>
        <a href="#def-constraint-array-tail"><em>Constraint array tail</em></a>
        <code>]</code>
    </div>
</div>

<div class="def" id="def-constraint">
    <div>
        <a href="#def-constraint"><em>Constraint</em></a> :
    </div>
    <div class="prod">
        <code>(</code>
        <a href="#def-oracle"><em>Oracle</em></a>
        <code>,&nbsp;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>,&nbsp;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>)</code>
    </div>
</div>

<div class="def" id="def-constraint-array-tail">
    <div>
        <a href="#def-constraint-array-tail"><em>Constraint array tail</em></a> :
    </div>
    <div class="prod">
        <span>$\varepsilon$</span>
    </div>
    <div class="prod">
        <code>,&nbsp;</code>
        <a href="#def-constraint"><em>Constraint</em></a>
        <a href="#def-constraint-array-tail"><em>Constraint array tail</em></a>
    </div>
</div>

<div class="def" id="def-address-array">
    <div>
        <a href="#def-address-array"><em>Address array</em></a> :
    </div>
    <div class="prod">
        <code>[]</code>
    </div>
    <div class="prod">
        <code>[</code>
        <a href="#def-address"><em>Address</em></a>
        <a href="#def-address-array-tail"><em>Address array tail</em></a>
        <code>]</code>
    </div>
</div>

<div class="def" id="def-address-array-tail">
    <div>
        <a href="#def-address-array-tail"><em>Address array tail</em></a> :
    </div>
    <div class="prod">
        <span>$\varepsilon$</span>
    </div>
    <div class="prod">
        <code>,&nbsp;</code>
        <a href="#def-address"><em>Address</em></a>
        <a href="#def-address-array-tail"><em>Address array tail</em></a>
    </div>
</div>

<div class="def" id="def-oracle">
    <div>
        <a href="#def-oracle"><em>Oracle</em></a> :
    </div>
    <div class="prod">
        <code>ConstantOracle&lt;</code>
        <a href="#def-oracle"><em>Oracle</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>MultisigOracle&lt;</code>
        <a href="#def-address-array"><em>Address array</em></a>
        <code>,&nbsp;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>UnsupportedOracle&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

<div class="def" id="def-address">
    <div>
        <a href="#def-address"><em>Address</em></a> :
    </div>
    <div class="prod">
        Any address encoded with an
        <a href="https://eips.ethereum.org/EIPS/eip-55">EIP-55</a>
        checksum. There is a finite number of addresses; therefore, the set of
        words matched by the <a href="#def-address"><em>Address</em></a>
        non-terminal is a context-free language.
    </div>
</div>

<div class="def" id="def-integer">
    <div>
        <a href="#def-integer"><em>Integer</em></a> :
    </div>
    <div class="prod">
        <code>0</code>
    </div>
    <div class="prod">
        <a href="#def-integer-first-digit"><em>Integer first digit</em></a> 
        <a href="#def-integer-digits"><em>Integer digits</em></a>
    </div>
    <div class="prod">
        <code>-</code>
        <a href="#def-integer-first-digit"><em>Integer first digit</em></a> 
        <a href="#def-integer-digits"><em>Integer digits</em></a>
    </div>
</div>

<div class="def" id="def-integer-first-digit">
    <div>
        <a href="#def-integer-first-digit"><em>Integer first digit</em></a> : <b>one of</b>
    </div>
    <div class="prod">
        <code>1</code>
        <code>2</code>
        <code>3</code>
        <code>4</code>
        <code>5</code>
        <code>6</code>
        <code>7</code>
        <code>8</code>
        <code>9</code>
    </div>
</div>

<div class="def" id="def-integer-digits">
    <div>
        <a href="#def-integer-digits"><em>Integer digits</em></a> : 
    </div>
    <div class="prod">
        <span>$\varepsilon$</span>
    </div>
    <div class="prod">
        <a href="#def-integer-digit"><em>Integer digit</em></a>
        <a href="#def-integer-digits"><em>Integer digits</em></a>
    </div>
</div>

<div class="def" id="def-integer-digit">
    <div>
        <a href="#def-integer-digit"><em>Integer digit</em></a> : <b>one of</b>
    </div>
    <div class="prod">
        <code>0</code>
        <code>1</code>
        <code>2</code>
        <code>3</code>
        <code>4</code>
        <code>5</code>
        <code>6</code>
        <code>7</code>
        <code>8</code>
        <code>9</code>
    </div>
</div>

<div class="def" id="def-nonempty-token-array">
    <div>
        <a href="#def-nonempty-token-array"><em>Non-empty token array</em></a> :
    </div>
    <div class="prod">
        <code>[</code>
        <a href="#def-token"><em>Token</em></a>
        <a href="#def-token-array-tail"><em>Token array tail</em></a>
        <code>]</code>
    </div>
</div>

<div class="def" id="def-token-array-tail">
    <div>
        <a href="#def-token-array-tail"><em>Token array tail</em></a> :
    </div>
    <div class="prod">
        <span>$\varepsilon$</span>
    </div>
    <div class="prod">
        <code>,&nbsp;</code>
        <a href="#def-token"><em>Token</em></a>
        <a href="#def-token-array-tail"><em>Token array tail</em></a>
    </div>
</div>

<div class="def" id="def-bytes">
    <div>
        <a href="#def-bytes"><em>Bytes</em></a> :
    </div>
    <div class="prod">
        <a href="#def-raw-bytes"><em>Raw bytes</em></a>
    </div>
    <div class="prod">
        <a href="#def-string-bytes"><em>String bytes</em></a>
    </div>
    <div class="prod">
        <a href="#def-map-bytes"><em>Map bytes</em></a>
    </div>
    <div class="prod">
        <code>keccak256(</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>)</code>
    </div>
</div>

<div class="def" id="def-raw-bytes">
    <div>
        <a href="#def-raw-bytes"><em>Raw bytes</em></a> :
    </div>
    <div class="prod">
        <code>0x</code>
        <a href="#def-hex-digit-pairs"><em>Hex digit pairs</em></a>
    </div>
</div>

<div class="def" id="def-hex-digit-pairs">
    <div>
        <a href="#def-hex-digit-pairs"><em>Hex digit pairs</em></a> :
    </div>
    <div class="prod">
        <span>$\varepsilon$</span>
    </div>
    <div class="prod">
        <a href="#def-hex-digit"><em>Hex digit</em></a>
        <a href="#def-hex-digit"><em>Hex digit</em></a>
        <a href="#def-hex-digit-pairs"><em>Hex digit pairs</em></a>
    </div>
</div>

<div class="def" id="def-hex-digit">
    <div>
        <a href="#def-hex-digit"><em>Hex digit</em></a> : <b>one of</b>
    </div>
    <div class="prod">
        <code>0</code>
        <code>1</code>
        <code>2</code>
        <code>3</code>
        <code>4</code>
        <code>5</code>
        <code>6</code>
        <code>7</code>
        <code>8</code>
        <code>9</code>
        <code>a</code>
        <code>b</code>
        <code>c</code>
        <code>d</code>
        <code>e</code>
        <code>f</code>
    </div>
</div>

<div class="def" id="def-string-bytes">
    <div>
        <a href="#def-string-bytes"><em>String bytes</em></a> :
    </div>
    <div class="prod">
        <code>"</code>
        <a href="#def-printable-string-characters"><em>Printable string characters</em></a>
        <code>"</code>
    </div>
</div>

<div class="def" id="def-printable-string-characters">
    <div>
        <a href="#def-printable-string-characters"><em>Printable string characters</em></a> :
    </div>
    <div class="prod">
        <span>$\varepsilon$</span>
    </div>
    <div class="prod">
        <a href="#def-printable-string-character"><em>Printable string character</em></a>
        <a href="#def-printable-string-characters"><em>Printable string characters</em></a>
    </div>
</div>

<div class="def" id="def-printable-string-character">
    <div>
        <a href="#def-printable-string-character"><em>Printable string character</em></a> :
    </div>
    <div class="prod">
        Any printable ASCII character except double quote and backslash
        (U+0020–U+0021, U+0023–U+005B, or U+005D–U+007E).
    </div>
</div>

<div class="def" id="def-map-bytes">
    <div>
        <a href="#def-map-bytes"><em>Map bytes</em></a> :
    </div>
    <div class="prod">
        <code>{}</code>
    </div>
    <div class="prod">
        <code>{</code>
        <a href="#def-map-entry"><em>Map entry</em></a>
        <a href="#def-map-entries-tail"><em>Map entries tail</em></a>
        <code>}</code>
    </div>
</div>

<div class="def" id="def-map-entries-tail">
    <div>
        <a href="#def-map-entries-tail"><em>Map entries tail</em></a> :
    </div>
    <div class="prod">
        <span>$\varepsilon$</span>
    </div>
    <div class="prod">
        <code>,</code>
        <a href="#def-map-entry"><em>Map entry</em></a>
        <a href="#def-map-entries-tail"><em>Map entries tail</em></a>
    </div>
</div>

<div class="def" id="def-map-entry">
    <div>
        <a href="#def-map-entry"><em>Map entry</em></a> :
    </div>
    <div class="prod">
        <code>"</code>
        <a href="#def-printable-string-characters"><em>Printable string characters</em></a>
        <code>":"</code>
        <a href="#def-printable-string-characters"><em>Printable string characters</em></a>
        <code>"</code>
    </div>
</div>

## Abstract operations

### keccak256(<var>arg</var>)

The abstract operation keccak256 takes a byte sequence <var>arg</var> and
returns its keccak256 digest as a byte sequence.

### AddressToBytes(<var>address</var>)

The abstract operation AddressToBytes takes an address <var>address</var> and
returns a sequence of 20 bytes that represent it.

## Syntax-directed operations

### WeiAmount

<div class="def">
    <div>
        <a href="#def-token"><em>Token</em></a> :
    </div>
    <div class="prod">
        <a href="#def-token-amount"><em>Token amount</em></a>
        <code>&nbsp;</code>
        <a href="#def-token-construction"><em>Token construction</em></a>
    </div>
</div>

1. Let <var>amountStr</var> be the text matched by [*Token
   amount*](#def-token-amount).
1. Let <var>amountStrUnprefixed</var> be <var>amountStr</var>.
1. If <var>amountStrUnprefixed</var> starts with `~`, remove that prefix.
1. Let <var>roundedAmount</var> be <var>amountStrUnprefixed</var> interpreted as
   a rational number written in base-10 with `.` as the separator between the
   integer and fractional parts.
1. Let <var>weiPerUnit</var> be [WeiPerUnit](#weiperunit) of
    [*Token construction*](#def-token-construction).
1. Let <var>weiAmount</var> be $\left\lfloor \text{\htmlClass{var}
    {roundedAmount}} \cdot \text{\htmlClass{var}{weiPerUnit}} \right\rceil$.
1. If <var>weiAmount</var> is larger than or equal to $2^{256}$, return an
   error.
1. Let <var>encodedAmount</var> be
   [EncodeWeiAmount](#encodeweiamount)(<var>weiAmount</var>,
   <var>weiPerUnit</var>).
1. If <var>encodedAmount</var> does not equal <var>amountStr</var>, return an
   error.
1. Return <var>weiAmount</var>.

### BlueprintAddress

<div class="def">
    <div>
        <a href="#def-token"><em>Token</em></a> :
        <a href="#def-token-amount"><em>Token amount</em></a>
        <code>&nbsp;</code>
        <a href="#def-token-construction"><em>Token construction</em></a>
    </div>
</div>

1. Return [BlueprintAddress](#blueprintaddress) of [*Token
   construction*](#def-token-construction).

<div class="def">
    <div>
        <a href="#def-token-construction"><em>Token construction</em></a> :
        <code>NativeToken&lt;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return the address <code>0xF3F67A0F38BF0A61DD2D93ADf9B04753D39C631C</code>.

<div class="def">
    <div>
        <a href="#def-token-construction"><em>Token construction</em></a> :
        <code>ERC20&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return the address <code>0x01B522c50242747c576717052FBA75e7fA2aa6a8</code>.

<div class="def">
    <div>
        <a href="#def-token-construction"><em>Token construction</em></a> :
        <code>Basket&lt;</code>
        <a href="#def-nonempty-token-array"><em>Non-empty token array</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return the address <code>0x52B785358dDAff5B7A8C16b52f0C2f7C21f3eAa4</code>.

<div class="def">
    <div>
        <a href="#def-token-construction"><em>Token construction</em></a> :
        <code>ComposablePrediction&lt;</code>
        <a href="#def-token"><em>Token</em></a>
        <code>,&nbsp;</code>
        <a href="#def-constraint-array"><em>Constraint array</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return the address <code>0x53e479FE18D269292851413Fe2094eb62b370B19</code>.

<div class="def">
    <div>
        <a href="#def-token-construction"><em>Token construction</em></a> :
        <code>WithMetadata&lt;</code>
        <a href="#def-token"><em>Token</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return [BlueprintAddress](#blueprintaddress) of [*Token*](#def-token).

<div class="def">
    <div>
        <a href="#def-token-construction"><em>Token construction</em></a> :
        <code>UnsupportedBlueprint&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return [Address](#address) of [*Address*](#def-address).

### ExternalTokenId

<div class="def">
    <div>
        <a href="#def-token"><em>Token</em></a> :
        <a href="#def-token-amount"><em>Token amount</em></a>
        <code>&nbsp;</code>
        <a href="#def-token-construction"><em>Token construction</em></a>
    </div>
</div>

1. Return [ExternalTokenId](#externaltokenid) of [*Token
   construction*](#def-token-construction).

<div class="def">
    <div>
        <a href="#def-token-construction"><em>Token construction</em></a> :
    </div>
    <div class="prod" data-rule="native-token">
        <code>NativeToken&lt;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod" data-rule="erc20">
        <code>ERC20&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod" data-rule="basket">
        <code>Basket&lt;</code>
        <a href="#def-nonempty-token-array"><em>Non-empty token array</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>ComposablePrediction&lt;</code>
        <a href="#def-token"><em>Token</em></a>
        <code>,&nbsp;</code>
        <a href="#def-constraint-array"><em>Constraint array</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>UnsupportedBlueprint&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Let <var>address</var> be [BlueprintAddress](#blueprintaddress) of [*Token
   construction*](#def-token-construction).
1. Let <var>addressBytes</var> be
   [AddressToBytes](#addresstobytes)(<var>address</var>).
1. Let <var>internalTokenId</var> be [InternalTokenId](#internaltokenid) of
   [*Token construction*](#def-token-construction).
1. Let <var>toHash</var> be the concatenation of <var>addressBytes</var> and
   <var>internalTokenId</var>.
1. Return [keccak256](#keccak256)(<var>toHash</var>).

<div class="def">
    <div>
        <a href="#def-token-construction"><em>Token construction</em></a> :
        <code>WithMetadata&lt;</code>
        <a href="#def-token"><em>Token</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return [externalTokenId](#externaltokenid) of [*Token*](#def-token).

<div class="def">
    <div>
        <a href="#def-token-construction"><em>Token construction</em></a> :
        <code>UnknownBlueprint&lt;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return [Bytes](#bytes) of [*Bytes*](#def-bytes).

### InternalTokenId

<div class="def">
    <div>
        <a href="#def-token"><em>Token</em></a> :
        <a href="#def-token-amount"><em>Token amount</em></a>
        <code>&nbsp;</code>
        <a href="#def-token-construction"><em>Token construction</em></a>
    </div>
</div>

1. Return [InternalTokenId](#internaltokenid) of [*Token
   construction*](#def-token-construction).

<div class="def">
    <div>
        <a href="#def-token-construction"><em>Token construction</em></a> :
        <code>NativeToken&lt;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return a byte sequence of 32 zeros.

<div class="def">
    <div>
        <a href="#def-token-construction"><em>Token construction</em></a> :
        <code>ERC20&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Let <var>zeros</var> be a byte sequence of 12 zeros.
1. Let <var>address</var> be [Address](#address) of [*Address*](#def-address).
1. Let <var>addressBytes</var> be
   [AddressToBytes](#addresstobytes)(<var>address</var>).
1. Return the concatenation of <var>zeros</var> and <var>addressBytes</var>.

<div class="def">
    <div>
        <a href="#def-token-construction"><em>Token construction</em></a> :
        <code>Basket&lt;</code>
        <a href="#def-nonempty-token-array"><em>Non-empty token array</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Let <var>map</var> be [TokenMap](#tokenmap) of [*Non-empty token
   array*](#def-nonempty-token-array).
1. Let <var>gcd</var> be [WeiPerUnit](#weiperunit) of [*Token
   construction*](#def-token-construction).
1. Let <var>buffer</var> be the empty sequence.
1. For each entry <var>entry</var> in <var>map</var>, in lexicographical
   order as determined by the entries' keys:

   1. Let <var>externalTokenId</var> be the key of <var>entry</var>.
   1. Let <var>weiAmount</var> be the value of <var>entry</var>.
   1. Append <var>externalTokenId</var> to <var>buffer</var>.
   1. Set <var>normalizedAmount</var> to $\frac{\text{\htmlClass{var}
      {weiAmount}}}{\text{\htmlClass{var}{gcd}}}$.
   1. Let <var>encodedAmount</var> be <var>normalizedAmount</var> encoded as a
      sequence of 32 bytes in big-endian order.
   1. Append <var>encodedAmount</var> to <var>buffer</var>.

1. Return <var>buffer</var>.
   
<div class="def">
    <div>
        <a href="#def-token-construction"><em>Token construction</em></a> :
        <code>ComposablePrediction&lt;</code>
        <a href="#def-token"><em>Token</em></a>
        <code>,&nbsp;</code>
        <a href="#def-constraint-array"><em>Constraint array</em></a>
        <code>&gt;</code>
    </div>
</div>

1. TODO

<div class="def">
    <div>
        <a href="#def-token-construction"><em>Token construction</em></a> :
        <code>WithMetadata&lt;</code>
        <a href="#def-token"><em>Token</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return [InternalTokenId](#internaltokenid) of [*Token*](#def-token).

<div class="def">
    <div>
        <a href="#def-token-construction"><em>Token construction</em></a> :
        <code>UnsupportedBlueprint&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return [Bytes](#bytes) of [*Bytes*](#def-bytes).

### WeiPerUnit

<!-- <div>
    <a href="#def-token"><em>Token</em></a> :
    <div>
        <a href="#def-token-amount"><em>Token amount</em></a>
        <code>&nbsp;</code>
        <a href="#def-token-construction"><em>Token construction</em></a>
    </div>
</div>
1. Return [WeiPerToken](#weipertoken) of [Token construction](#def-token-construction). -->

<div class="def">
    <a href="#def-token-construction"><em>Token construction</em></a> :
    <div class="prod">
        <code>NativeToken&lt;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>ERC20&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-integer"><em>Integer</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Let <var>decimals</var> be the [IntegerValue](#integervalue) of
   [*Integer*](#def-integer).
1. If <var>decimals</var> is less than $0$ or more than $255$, return an error.
1. Return $10$ raised to the power of <var>decimals</var>.

<div class="def">
    <div>
        <a href="#def-token-construction"><em>Token construction</em></a> :
        <code>Basket&lt;</code>
        <a href="#def-nonempty-token-array"><em>Non-empty token array</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Let <var>map</var> be [TokenMap](#tokenmap) of [*Non-empty token
   array*](#def-nonempty-token-array).
1. Let <var>result</var> be $0$.
1. For each entry <var>entry</var> in <var>map</var>:

   1. Let <var>weiAmount</var> be the value of <var>entry</var>.
   1. Set <var>result</var> to the greatest common divisor of <var>result</var>
      and <var>weiAmount</var>.

1. Return <var>result</var>.

<div class="def">
    <div>
        <a href="#def-token-construction"><em>Token construction</em></a> :
    </div>
    <div class="prod">
        <code>ComposablePrediction&lt;</code>
        <a href="#def-token"><em>Token</em></a>
        <code>,&nbsp;</code>
        <a href="#def-constraint-array"><em>Constraint array</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>WithMetadata&lt;</code>
        <a href="#def-token"><em>Token</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return [WeiAmount](#weiamount) of [*Token*](#def-token).

<div class="def">
    <div>
        <a href="#def-token-construction"><em>Token construction</em></a> :
    </div>
    <div class="prod">
        <code>UnsupportedBlueprint&lt;</code>
        <a href="#def-address"><em>Address</em></a>
        <code>,&nbsp;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
    <div class="prod">
        <code>UnknownBlueprint&lt;</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>&gt;</code>
    </div>
</div>

1. Return $1$.

### TokenMap

<div class="def">
    <div>
        <a href="#def-nonempty-token-array"><em>Non-empty token array</em></a> :
        <code>[</code>
        <a href="#def-token"><em>Token</em></a>
        <a href="#def-token-array-tail"><em>Token array tail</em></a>
        <code>]</code>
    </div>
</div>

<div class="def">
    <div>
        <a href="#def-token-array-tail"><em>Token array tail</em></a> :
        <code>,&nbsp;</code>
        <a href="#def-token"><em>Token</em></a>
        <a href="#def-token-array-tail"><em>Token array tail</em></a>
    </div>
</div>

1. Let <var>firstExternalTokenId</var> be [ExternalTokenId](#externaltokenid) of
   [*Token*](#def-token).
1. Let <var>firstWeiAmount</var> be [WeiAmount](#weiamount) of
   [*Token*](#def-token).
1. If <var>firstWeiAmount</var> is $0$, return an error.
1. Let <var>map</var> be [TokenMap](#tokenmap) of [Token array
   tail](#def-token-array-tail).
1. If <var>map</var> has an entry with key <var>firstExternalTokenId</var>:

   1. Let <var>entry</var> be the <var>map</var> entry with key <var>
      firstExternalTokenId</var>.
   1. Remove <var>entry</var> from <var>map</var>.
   1. Let <var>oldValue</var> be the value of that entry.
   1. Let <var>newValue</var> be $\text{\htmlClass{var}{oldValue}} +
      \text{\htmlClass{var}{firstWeiAmount}}$.
   1. If <var>newValue</var> is larger than or equal to $2^{256}$, return an
      error.
   1. Set the value of <var>entry</var> to <var>newValue</var>.
   1. Insert <var>entry</var> into <var>map</var>.

1. Otherwise, insert a new entry into <var>map</var> with key <var>
   firstExternalTokenId</var> and value <var>firstWeiAmount</var>. 
1. Return <var>map</var>.

<div class="def">
    <div>
        <a href="#def-token-array-tail"><em>Token array tail</em></a> :
        <span>$\varepsilon$</span>
    </div>
</div>

1. Return the empty map.

### IntegerValue

<div class="def">
    <div>
        <a href="#def-integer"><em>Integer</em></a> :
    </div>
    <div class="prod">
        <code>0</code>
    </div>
    <div class="prod">
        <a href="#def-integer-first-digit"><em>Integer first digit</em></a> 
        <a href="#def-integer-digits"><em>Integer digits</em></a>
    </div>
    <div class="prod">
        <code>-</code>
        <a href="#def-integer-first-digit"><em>Integer first digit</em></a> 
        <a href="#def-integer-digits"><em>Integer digits</em></a>
    </div>
</div>

1. Return an integer whose base-10 representation is equal to the text matched
   by the [*Integer*](#def-integer) non-terminal.

### Bytes

<div class="def">
    <div>
        <a href="#def-bytes"><em>Bytes</em></a> :
        <a href="#def-raw-bytes"><em>Raw bytes</em></a>
    </div>
</div>

1. Return [Bytes](#bytes) of [*Raw bytes*](#def-raw-bytes).

<div class="def">
    <div>
        <a href="#def-raw-bytes"><em>Raw bytes</em></a> :
        <code>0x</code>
        <a href="#def-hex-digit-pairs"><em>Hex digit pairs</em></a>
    </div>
</div>

1. Return [Bytes](#bytes) of [*Hex digit pairs*](#def-hex-digit-pairs).

<div class="def">
    <div>
        <a href="#def-hex-digit-pairs"><em>Hex digit pairs</em></a> :
        <span>$\varepsilon$</span>
    </div>
</div>

1. Return an empty sequence.

<div class="def">
    <div>
        <a href="#def-hex-digit-pairs"><em>Hex digit pairs</em></a> :
        <a href="#def-hex-digit"><em>Hex digit</em></a>
        <a href="#def-hex-digit"><em>Hex digit</em></a>
        <a href="#def-hex-digit-pairs"><em>Hex digit pairs</em></a>
    </div>
</div>

1. Let <var>x</var> be the integer whose hexadecimal representation is equal to
   the text matched by the first [*Hex digit*](#def-hex-digit).
1. Let <var>y</var> be the integer whose hexadecimal representation is equal to
   the text matched by the second [*Hex digit*](#def-hex-digit).
1. Let <var>byte</var> be $16\text{\htmlClass{var}{x}} + \text{\htmlClass{var}
   {y}}$.
1. Let <var>prefix</var> be the sequence containing the single element
   <var>byte</var>.
1. Let <var>suffix</var> be [Bytes](#bytes) of the inner [*Hex digit
   pairs*](#def-hex-digit-pairs).
1. Return the concatenation of <var>prefix</var> and <var>suffix</var>.

<div class="def">
    <div>
        <a href="#def-bytes"><em>Bytes</em></a> :
        <a href="#def-string-bytes"><em>String bytes</em></a>
    </div>
</div>

1. Return [Bytes](#bytes) of [*String bytes*](#def-string-bytes).

<div class="def">
    <div>
        <a href="#def-string-bytes"><em>String bytes</em></a> :
        <code>"</code>
        <a href="#def-printable-string-characters"><em>Printable string characters</em></a>
        <code>"</code>
    </div>
</div>

1. Let <var>s</var> be the empty sequence.
1. For each character <var>c</var> of the text matched by [*Printable string
   characters*](#def-printable-string-characters), append the ASCII code point
   of <var>c</var> to <var>s</var>.
1. Return <var>s</var>.

<div class="def">
    <div>
        <a href="#def-bytes"><em>Bytes</em></a> :
        <a href="#def-map-bytes"><em>Map bytes</em></a>
    </div>
</div>

1. Let <var>s</var> be the empty sequence.
1. For each character <var>c</var> of the text matched by [*Map
   bytes*](#def-map-bytes), append the ASCII code point of <var>c</var> to
   <var>s</var>.
1. Return <var>s</var>.

<div class="def">
    <div>
        <a href="#def-bytes"><em>Bytes</em></a> :
        <code>keccak256(</code>
        <a href="#def-bytes"><em>Bytes</em></a>
        <code>)</code>
    </div>
</div>

1. Let <var>bytes</var> be [Bytes](#bytes) of [*Bytes*](#def-bytes).
1. Return [keccak256](#keccak256)(<var>bytes</var>).

[core]: https://github.com/blueprintsfi/core
