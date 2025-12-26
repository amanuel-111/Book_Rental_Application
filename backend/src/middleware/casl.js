const { AbilityBuilder, createMongoAbility } = require('@casl/ability');

const defineAbilitiesFor = (user) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (!user) {
    return build();
  }

  if (user.role === 'ADMIN') {
    // Admin can do everything
    can('manage', 'all');
  } else if (user.role === 'OWNER') {
    // Owner permissions
    can('read', 'User', { id: user.id });
    can('update', 'User', { id: user.id });
    
    // Owner can manage their own books
    can('create', 'Book');
    can('read', 'Book', { owner_id: user.owner_id });
    can('update', 'Book', { owner_id: user.owner_id });
    can('delete', 'Book', { owner_id: user.owner_id });
    
    // Owner can read their own data
    can('read', 'Owner', { id: user.owner_id });
    can('update', 'Owner', { id: user.owner_id });
    
    // Owner can read their wallet
    can('read', 'Wallet', { owner_id: user.owner_id });
    
    // Owner can read their rentals
    can('read', 'Rental', { owner_id: user.owner_id });
    
    // Owner can read categories
    can('read', 'Category');
    
    // Cannot access other owners' data
    cannot('read', 'Owner', { id: { $ne: user.owner_id } });
    cannot('read', 'Book', { owner_id: { $ne: user.owner_id } });
    cannot('read', 'Wallet', { owner_id: { $ne: user.owner_id } });
    
  } else if (user.role === 'USER') {
    // User permissions
    can('read', 'User', { id: user.id });
    can('update', 'User', { id: user.id });
    
    // User can read approved books from approved owners
    can('read', 'Book', { is_approved: true });
    
    // User can create rentals
    can('create', 'Rental');
    can('read', 'Rental', { user_id: user.id });
    can('update', 'Rental', { user_id: user.id });
    
    // User can read categories
    can('read', 'Category');
  }

  return build();
};

const checkPermission = (action, subject, field) => {
  return (req, res, next) => {
    const ability = defineAbilitiesFor(req.user);
    
    if (!ability.can(action, subject, field)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    req.ability = ability;
    next();
  };
};

const attachAbility = (req, res, next) => {
  req.ability = defineAbilitiesFor(req.user);
  next();
};

module.exports = {
  defineAbilitiesFor,
  checkPermission,
  attachAbility
};