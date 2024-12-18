# domain

workflow: "Place Order"
  triggerd by:
    "Order from recieved" event (when Quote is not checked)
  primary input:
    An order form
  other input:
    Product catalog
  ouput events:
    "Order placed" event
  side-effects:
    An acknowledgement is sent to the customer.
    along with the placed order

bounded context: Order-Taking

data Order = CustomerInfo
  AND ShippingAddress
  AND BillingAddress
  AND list of OrderLines
  And AmoutnToBill

data OrderLine = 
  Product
  AND Quantity
  AND Price

## ドメインモデルのパターン

### 単純な値

```fs
type CustomerId = 
  | CustomerId of int

type WidgetCode = WidgetCode of string
type UnitQuantity = UnitQuantity of int
```

## 複雑なデータのモデリング

### F# のレコード型　によるモデリング

```fs
type Order = {
  CustomerInfo: CustomerInfo
  ShippingAddress: ShippingAddress
  BillingAddress: BillingAddress
  OrderLine: OrderLine list
  AmountToBill: 
}
```

```ts
type Person = {
    readonly CustomerInfo: CustomerInfo;
    readonly ShippingAddress: ShippingAddress;
};
```

### 未知の型のモデリング

```ts
type Hoge = undefined
```

### 選択型

```fs
type OrderQuantity = 
| UnitQuantity
| KilogramQuantity
```

## 関数によるワークフローのモデリング

```fs
type ValidateOrder = UnvalidatedOrder -> ValidatedOrder
```

### 複雑な入力と出力の処理

1つのワークフローがアウトプットAとアウトプットBを持つ
→ レコード型で表現する

```fs
type PlaceOrderEvents = {
  AcknowledgementSent : AcknowledgementSent
  OrderPlaced : OrderPlaced
  BillableOrderPlaced : BillableOrderPlaced
}

// 未検証の注文データを起点とし、最後に<注文確定イベント>を返す関数として定義する
type PlaceOrder = UnvalidatedOrder -> PlaceOrderEvents
```

workflow "Categorize Inbound Mail" = 
  input: Envelope contents
  output:
    QuoteForm (put on appropriate pile)
    OR OrderForm (put on appropriate pile)
    OR 

→ どうワークフローにするか？

```fs
type EnvelopeContents = EnvelopeContents of string
type CategorizedEmail =
| Quote of QuoteForm
| Order of OrderForm

type CategorizedInboundEmail = EnvelopeContents -> CategorizedMail
```

### 入力のモデリング

異なる入力の選択肢がある　→ 選択型を作成する

複数の入力が必須である場合

"Calculate Prices" =
 input: OrderForm, ProductCatalog
 output: PriceOrder

```fs
type CalculatePrice = OrderForm -> ProductCatalog -> PriceOrder
```

もしくは

```fs
type CalculatePricesInput = {
  OrderForm: OrderForm
  ProductCatalog: ProductCatalog
}

type CalculatePrices = CalculatePricesInput -> PriceOrder
```

### 関数のシグネチャでエフェクトを文書化する

```fs
type ValidateOrder = UnvalidatedOrder -> ValidatedOrder
```
→ 前提として「検証が常に成功すること」だが、もちろん失敗もするのでそれを型で表現する

```fs
type ValidatedOrder = UnvalidatedOrder -> Result<ValidatedOrder, ValidationError list>

and ValidationError = {
  FieldName: string
  ErrorDescription: string
}
```

### entityの表現方法

```fs
type UnpaidInvoice = {
  InvoiceId: InvoiceId // 内側に保持するID
  // 未払いのケースのその他の情報
}

type PaidInvoice = {
  InvoiceId: InvoiceId // 内側に保持するID
  // 支払い済みのケースその他の情報
}

// トップレベルの請求書型
type Invoice = 
| Unpaid of UnpaidInvoice
| Paid of PaidInvoice
```

この方法はパターンマッチの際にIDも含めて全てのデータに一度にアクセスできる

```fs
match invoice with
  | Unpaid unpaideInvoice ->
    printfn ""
  | Paid paidInvoice ->
    printfn ""
```

## 集約

OrderとOrderLineの関係

→ 注文は識別子を持つ。
→ 注文明細行も識別子を持つ。

そして注文明細を変えるなら注文レベルで新しくデータの箱をコピーするべき

→ このようなエンティティのコレクションを集約ルートと呼ぶ

仮に注文に顧客情報を紐づける必要があるとする

```fs
type Order = {
  OrderId: OrderId
  Customer: Customer
  OrderLines: OrderLine list
  // etc
}
```

## まとめ

境界づけられたコンテキストを表現するためにF#のネームスペースを利用する

```fs
type WidgetCode = WidgetCode of string
type GizmoCode = GizmoCode of string
type ProductCode = 
| Widget of WidgetCode
| Gizmo of GizmoCode

// 注文数関連
type UnitQuantity = UnitQuantity of int
type KilogramQuantity = KillogramQuantity of decimal
type OrderQuantity = 
| Unit of UnitQuantity
| Kilos of KilogramQuantity

// 他の未定義vo
type OrderId = Undefined
type OrderLineId = Undefined
type CustomerId = Undefined
type CustomerInfo = Undefined
type ShippingAddress = Undefined
type Price = Undefined
type BillingAmount = Undefined

type Order = {
  Id : OrderId
  CustomerId : CustomerId
  ShippingAddress : ShippingAddress
  BillingAddress : BillingAddress
  OrderLines : OrderLine list
  AmountToBill : BillingAmount
}

and OrderLine = {
  Id : OrderLineId
  OrderId : OrderId
  ProductCode : ProductCode
  OrderQuantity : OrderQuantity
  Price : Price
}

// ワークフロー自体の定義
type UnvalidatedOrder = {
  OrderId : OrderId
  CustomerInfo : 
  ShippingAddress : 
}

type PlaceOrderEvents = {
  AcknowledgementSent : 
  OrderPlaced : 
  BillableOrderPlaced : 
}

type PlaceOrderError = 
| ValidationError of ValidationError list
| その他のエラー

and ValidationError = {
  FieldName : string
  ErrorDescription : string
}

// 注文確定プロセス
type PlaceOrder = UnvalidatedOrder -> Result<PlaceOrderEvents, PlaceOrderError>
```

## 見えてきたポイント

特定の関数でしか触れないようにプライベートコンストラクタにしておく

### ステートマシンの表現方法

```fs
type Item = 
type ActiveCartData = { UnpaidItems: Item list }
type PaidCartData = { PaidItems: Item list; Payment: float }

type ShoppingCart = 
 | EmptyCart
 | ActiveCart of ActiveCartData
 | PaidCart of PaidCartData

let addItem cart item = 
  match cart with
    | EmptyCart ->
      ActiveCart {UnpaidItems = [item]}

    | ActiveCart {UnpaidItems=existingItems} ->
      ActiveCart {UnpaidItems = item :: existingItems}
    
    | PaidCart ->
      cart
```

## 型を使ったワークフローのモデリング

```fs
type CheckProductCodeExists = ProductCode -> bool
type CheckedAddress = CheckedAddress of UnvalidatedAddress
type AddressValidationError = AddressValidationError of string
type CheckAddressExists = UnvalidatedAddress -> Result<CheckedAddress, AddressValidationError>

type ValidateOrder =
  CheckProductCodeExists // 依存関係
    -> CheckAddressExists // 依存関係
    -> UnvalidatedOrder // 入力
    -> Result<ValidatedOrder, ValidationError> // 出力
```

確認書モデリング

```fs
type HtmlString = HtmlString of string

type OrderAcknowledgement = {
  EmailAddress : EmailAddress
  Letter : HtmlString
}

type CreateOrderAcknowledgementLetter = 
  PriceOrder -> HtmlString
```

型ミスマッチ問題をどうとくか

## パイプラインの合成

### パイプラインの概要

- 検証ステップの出力をvalidatedOrderに変換する。失敗した場合はエラー。
- 検証ステップの出力に幾つか情報を付加することでPriceOrderに変換する
- 価格設定ステップの出力を取得して確認書を作成して送信する。
- 何が起こったかを表す一連のイベントを作成し、それらを返す。


## スライド各種メモ

https://speakerdeck.com/naoya/functional-typescript?slide=13

和で組み合わせて構築したものはパターンマッチで分解

## テーブル設計

```sql
-- Teacher Table
CREATE TABLE teacher (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  status VARCHAR(255) NOT NULL, -- ENUMの代わりにVARCHAR
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
) ENGINE=InnoDB;

-- Student Table
CREATE TABLE student (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  banned BOOLEAN NOT NULL DEFAULT FALSE, -- 生徒がBANされているかどうか
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  deleted_at BIGINT NULL -- 生徒削除時に値が設定される
) ENGINE=InnoDB;

-- Lesson Table
CREATE TABLE lesson (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  teacher_id VARCHAR(255) NOT NULL, -- 先生のID（必須）
  student_id VARCHAR(255),          -- 生徒のID（未予約時はNULL）
  status VARCHAR(255) NOT NULL,     -- ENUMの代わりに状態をVARCHARで保存 (e.g., 'opened', 'booked', 'completed')
  start_at BIGINT NOT NULL,         -- レッスン開始時間 (UNIX時間ミリ秒)
  end_at BIGINT NOT NULL,           -- レッスン終了時間 (UNIX時間ミリ秒)
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  CONSTRAINT fk_lesson_teacher FOREIGN KEY (teacher_id) REFERENCES teacher(id),
  CONSTRAINT fk_lesson_student FOREIGN KEY (student_id) REFERENCES student(id)
) ENGINE=InnoDB;

-- LessonReport Table
CREATE TABLE lesson_report (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  lesson_id VARCHAR(255) NOT NULL UNIQUE, -- レポートは各レッスンに1つだけ紐づく
  feedback_comments TEXT NOT NULL,        -- フィードバックコメント
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  CONSTRAINT fk_report_lesson FOREIGN KEY (lesson_id) REFERENCES lesson(id)
) ENGINE=InnoDB;

```