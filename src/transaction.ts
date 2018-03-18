/*
Транзакция

Функции:
- накопление изменений
- применение изменений
- оповещение об изменениях
- сохранение истории изменений

Не должно быть (не стоит услжнять) ???:
- цепочки транзакций
- дерево транзакций

Особая транзакция для фиксации что было закачано из сервера/реального хранилища ???
 */
import store from "./store";


export let current_transaction = null;
export let transaction_history = [];


enum TransactionStatus {
	IS_COMPLETED = 'is completed',
	IS_ROLLED    = 'is rolled',
	IN_PROGRESS  = 'in progress'
}


class Transaction {

	private _name;
  get name() { return this._name; }

  private _changes = {
		// что случилось во время этой транзакции
		// это копии объектов где есть только базовые переменные отмеченные декоратором как field или key т.е. ни каких производных/вычисляемых
  	deleted: [],
		created: [], // id к объектам добавляються когда?
		changed: []
	};

  private _status : TransactionStatus;
	get status() { return this._status; }

  constructor(name: string) {
		if (current_transaction) {
			throw `You have to commit current transaction "${current_transaction.name}" before start new one "${name}".`
		}
    this._name = name;
    current_transaction = this;
  }

  public commit() {
		if (this.status == TransactionStatus.IN_PROGRESS) {
			// 1 применение изменений на сервере/реальном хранилице
			// 2 оповещение об изменениях всех кто подписался
			// 3 сохранение истории изменений

			this._status = TransactionStatus.IS_COMPLETED;
			transaction_history.push(this);
			current_transaction = null;
		}
		else if (this.status == TransactionStatus.IS_ROLLED) {
			throw `You cannot commit transaction "${this.name}" that was rolled.`
		}
		else if (this.status == TransactionStatus.IS_COMPLETED) {
			throw `You cannot commit transaction "${this.name}" that already completed.`
		}
		else {
			throw `It cannot be.`
		}
  }

  public rollback() {
    // откатываем изменения за эту транзакцию
		if (this.status == TransactionStatus.IS_COMPLETED) {
			// придеться откатить все и на сервере
		}
		if (this.status == TransactionStatus.IS_ROLLED) {
			// нам нечего откатывать, вообще почему мы откатываем то что было уже откачено
			// это явно ошибка, такого происходить не должно
		}
		if (this.status == TransactionStatus.IN_PROGRESS) {
			// откатываем все в кэше, на сервере ни чего менять не нужно, т.к. туда еще ни чего не ушло
			// так же не нужно ни кого ни о чем оповещать, т.к. и эти события еще не были вызванны
		}
  }
}


function addChangesToCurrentTransaction(model_name: string, id, prev_state, new_changes) {

  if (!store.history[model_name]    ) { store.history[model_name] = {}; }
  if (!store.history[model_name][id]) { store.history[model_name][id] = new Map(); }
  let history = store.history[model_name][id];

  // История может вестись только в контексте транзакции.
  if (current_transaction == null) { throw new Error(`You cannot change data without transaction.`); }

  let transaction_current;

  // Вычисляем суммарные изменения в этой транзакции
  let current = null;
  if (history.size) {
    let history_prev = Array.from(history.entries()).pop();
    // предыдущая история это все еще наша транзакция? тогда делаем merge в предыдущею историю
    if (history_prev[0] === transaction_current) { current = Object.assign(history_prev[1], new_changes); }
    // предыдущея история из другой транзакции
    else { current = new_changes; }
  }
  else { current = new_changes; }

  // В current должны находиться суммарные изменения по транзакции
  history.set(transaction_current, current);

  // сохраняем историю в самой транзакции
  if (!transaction_current.history[model_name]        ) { transaction_current.history[model_name]         = {}; }
  if (!transaction_current.history[model_name][id]    ) { transaction_current.history[model_name][id]     = {old: null, new: null}; }
  if (!transaction_current.history[model_name][id].old) { transaction_current.history[model_name][id].old = prev_state; }
  transaction_current.history[model_name][id].new = current;
}

// Decorator!
// should run recalculation value of subscribers
// and sync remote store (if remote store is exist)
function transaction() {

}

export default transaction;

